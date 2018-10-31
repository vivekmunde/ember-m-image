import Ember from 'ember';
import layout from '../templates/components/m-image';
import mImageDomLoader from '../utils/m-image-dom-loader';

export default Ember.Component.extend({

  layout,
  tagName: 'img',
  attributeBindings: ['_imageSrc:src', 'alt', 'crossorigin', 'height', 'longdesc', 'sizes', 'width'],
  classNameBindings: ['imageStateCss'],
  imageStateCss: '',

  // @private
  _domLoader: Ember.computed(function () {
    return mImageDomLoader();
  }),

  // @private
  _updateState(css, src) {
    if (!this.get('isDestroyed') && !this.get('isDestroying')) {
      this.set('imageStateCss', css);
      this.set('_imageSrc', src);
    }
  },

  // @private
  _onSuccess(_imageSrc) {
    this._updateState('complete', _imageSrc);
    this.sendAction('onLoadComplete');
  },

  // @private
  _onError() {
    this._updateState('error', this.get('fallbackImageSrc'));
    this.sendAction('onLoadError');
  },

  // @private
  _loadAlternateImage() {
    return this.get('_domLoader')(this.get('fallbackImageSrc')).then(this._onError.bind(this), this._onError.bind(this));
  },

  // @public
  loadImage() {
    const src = this.get('src');

    if (!Ember.isBlank(src)) {
      this.sendAction('onLoadStart');
      this._updateState('loading', this.get('preloaderImageSrc'));

      return (this.get('loader') || this.get('_domLoader'))(src)
        .then(this._onSuccess.bind(this), this._loadAlternateImage.bind(this));
    }
  },

  // @private
  imageSrcObserver: Ember.observer('src', function () {
    this.loadImage();
  }),

  // @private
  didInsertElement() {
    this.loadImage();
  }

});
