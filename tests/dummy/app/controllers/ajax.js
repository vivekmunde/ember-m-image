import Ember from 'ember';
import mImageAjaxLoader from 'ember-m-image/utils/m-image-ajax-loader';

export default Ember.Controller.extend({

    convertToBase64(imageData) {
        const encodeToBase64 = function (r) { if (!Ember.isBlank(r)) { for (var a, t, c, h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", A = "", e = 0, f = r.length; e < f;) { if (a = 255 & r.charCodeAt(e++), e == f) { A += h.charAt(a >> 2), A += h.charAt((3 & a) << 4), A += "=="; break } if (t = r.charCodeAt(e++), e == f) { A += h.charAt(a >> 2), A += h.charAt((3 & a) << 4 | (240 & t) >> 4), A += h.charAt((15 & t) << 2), A += "="; break } c = r.charCodeAt(e++), A += h.charAt(a >> 2), A += h.charAt((3 & a) << 4 | (240 & t) >> 4), A += h.charAt((15 & t) << 2 | (192 & c) >> 6), A += h.charAt(63 & c) } return A } };
        return `data:image/png;base64, ${encodeToBase64(imageData)}`;
    },

    ajaxLoader: Ember.computed(function () {
        return mImageAjaxLoader({
            dataType: 'text image',
            converters: {
                'text image': this.convertToBase64.bind(this)
            }
        });
    })
});
