import Ember from 'ember';

export default function mImageDomLoader() {

  const destroy = (imageContext) => {
    let {domElement, eventListeners} = imageContext;
    domElement.removeEventListener('load', eventListeners.load);
    domElement.removeEventListener('error', eventListeners.error);
    domElement = null;
    imageContext = null;
  };

  return function loadImage(src) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let image = new Image(),
        imageContext = {};

      const loadEventListener = function () {
        destroy(imageContext);
        resolve(src);
      },

        errorEventListener = function () {
          destroy(imageContext);
          reject();
        };

      imageContext.domElement = image;
      imageContext.eventListeners = {
        load: loadEventListener,
        error: errorEventListener
      };
      image.addEventListener('load', loadEventListener);
      image.addEventListener('error', errorEventListener);
      image.src = src;
    });
  }
}