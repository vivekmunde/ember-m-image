import Ember from 'ember';

export default function mImageAjaxLoader(ajaxOptions) {

  return function loadImage(src) {

    return new Ember.RSVP.Promise((resolve, reject) => {

      const onSuccess = function (imageData) {
        resolve(imageData);
      },

        onError = function () {
          reject();
        };

      return Ember.$.ajax(
        Object.assign(
          {
            type: 'GET',
            url: src,
            mimeType: 'text/plain; charset=x-user-defined',
          },
          ajaxOptions || {},
          {
            success: onSuccess,
            error: onError
          }));
    });
  }

}