import Ember from 'ember';
import mImageFetchLoader from 'ember-m-image/utils/m-image-fetch-loader';

export default Ember.Controller.extend({

    fetchLoader: Ember.computed(function () {
        return mImageFetchLoader();
    })

});
