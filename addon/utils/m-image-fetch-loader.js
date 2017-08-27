import Ember from 'ember';

export default function mImageFetchLoader(init) {

  function blobToBase64(blob) {
    return new Ember.RSVP.Promise((resolve, reject) => {

      if (Ember.isEmpty(blob)) {
        return resolve();
      }

      const reader = new window.FileReader();
      reader.readAsDataURL(blob);

      reader.addEventListener('load', function () {
        resolve(reader.result);
      });

      reader.addEventListener('error', function () {
        reject();
      });

    });
  }

  return function loader(src) {
    return new Ember.RSVP.Promise((resolve, reject) => {

      const onError = (error) => {
        reject(error);
      }

      const onSuccess = (response) => {
        response.blob().then((result) => {
          blobToBase64(result)
            .then((base64ImageSource) => {
              resolve(base64ImageSource);
            })
            .catch(onerror);
        });
      };

      return fetch(src, init || {})
        .then((response) => {
          if (response.ok) {
            onSuccess(response);
          } else {
            onError(response.json());
          }
        })
        .catch(onError);

    });
  }

}