import Ember from 'ember';
import layout from '../templates/components/m-image';

export default Ember.Component.extend({
  layout,
  tagName: 'img',
  encodeToBase64: true,
  useAjax: false,
  attributeBindings: ['_imageSrc:src', 'alt'],
  classNameBindings: ['imageStateCss'],
  imageStateCss: '',
  base64Encode(str) {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i == len) {
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt((c1 & 0x3) << 4);
        out += "==";
        break;
      }
      c2 = str.charCodeAt(i++);
      if (i == len) {
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt((c2 & 0xF) << 2);
        out += "=";
        break;
      }
      c3 = str.charCodeAt(i++);
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
      out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
  },
  convertToBase64ImageSrc(imageSrc, imageData, encodeToBase64) {
    const imageExtension = this.getImageSrcExtension(imageSrc);
    return `data:image${imageExtension ? `/${imageExtension}` : ''};base64, ${encodeToBase64 ? this.base64Encode(imageData) : imageData}`;
  },
  getImageSrcExtension(imageSrc) {
    return ((imageSrc.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi) || [''])[0]).replace('.', '');
  },
  getImageUsingAjax(imageSrc, encodeToBase64, ajaxOptions = {}) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return Ember.$.ajax(
        Object.assign(
          { mimeType: "text/plain; charset=x-user-defined" },
          ajaxOptions,
          {
            type: 'GET',
            url: imageSrc,
            success: imageData => resolve(this.convertToBase64ImageSrc(imageSrc, imageData, encodeToBase64)),
            error: () => reject()
          }));
    });
  },
  getImageUsingDOM(imageSrc) {
    this.destroyTemporaryDOM();
    return new Ember.RSVP.Promise((resolve, reject) => {
      return this.$(document).ready(() => {
        let _img = new Image();
        const loadEventListener = () => resolve(imageSrc),
          errorEventListener = () => reject();
        this.set('_img', {
          domElement: _img,
          eventListeners: {
            load: loadEventListener,
            error: errorEventListener
          }
        });
        _img.addEventListener('load', loadEventListener);
        _img.addEventListener('error', errorEventListener);
        _img.src = imageSrc;
      });
    });
  },
  destroyTemporaryDOM() {
    let _img = this.get('_img');
    if (!Ember.isEmpty(_img)) {
      const { domElement, eventListeners } = _img;
      domElement.removeEventListener('load', eventListeners.load);
      domElement.removeEventListener('error', eventListeners.error);
      this.set('_img', null);
    }
  },
  loadImage() {
    const imageSrc = this.get('imageSrc');
    const updateState = (css, imageSrc) => {
      this.set('imageStateCss', css);
      this.set('_imageSrc', imageSrc);
    };
    if (!Ember.isBlank(imageSrc)) {
      this.sendAction('onLoadStart');
      updateState('loading', this.get('preloaderImageSrc'));
      return (this.get('useAjax') ? this.getImageUsingAjax(imageSrc, this.get('encodeToBase64'), this.get('ajaxOptions')) : this.getImageUsingDOM(imageSrc))
        .then((_imageSrc) => {
          updateState('complete', _imageSrc);
          this.sendAction('onLoadComplete');
        }, () => {
          updateState('error', this.get('errorImageSrc'));
          this.sendAction('onLoadError');
        });
    }
  },
  imageSrcObserver: Ember.observer('imageSrc', function () {
    this.loadImage();
  }),
  didInsertElement() {
    this.loadImage();
  },
  willDestroyElement() {
    this.destroyTemporaryDOM();
  }
});
