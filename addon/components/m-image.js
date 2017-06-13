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
  encodeImageData(imageData) {
    return this.get('encodeToBase64') ? this.base64Encode(imageData) : imageData;
  },
  getEncodedImageSrc(imageSrc, imageData) {
    const imageExtension = this.getImageSrcExtension(imageSrc);
    return `data:image${imageExtension ? `/${imageExtension}` : ''};base64, ${this.encodeImageData(imageData)}`;
  },
  getImageSrcExtension(imageSrc) {
    return ((imageSrc.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi) || [''])[0]).replace('.', '');
  },
  getImageUsingAjax(imageSrc) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return Ember.$.ajax({
        type: 'GET',
        url: imageSrc,
        mimeType: "text/plain; charset=x-user-defined",
        success: imageData => resolve(this.getEncodedImageSrc(imageSrc, imageData)),
        error: () => reject()
      });
    });
  },
  getImageUsingDOM(imageSrc) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return this.$(document).ready(() => {
        let _$img = this.$('<img>')
          .css('display', 'none')
          .on('load', () => {
            _$img.remove();
            return resolve(imageSrc);
          })
          .on('error', () => {
            _$img.remove();
            this.set('_$img', null);
            return reject()
          });
        this.set('_$img', _$img);
        this.$('body').append(_$img);
        _$img.attr('src', imageSrc);
      });
    });
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
      return (this.get('useAjax') ? this.getImageUsingAjax(imageSrc) : this.getImageUsingDOM(imageSrc))
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
    let _$img = this.get('_$img');
    if (_$img) {
      _$img.remove();
    }
  }
});
