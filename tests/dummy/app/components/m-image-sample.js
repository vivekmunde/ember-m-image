import Ember from 'ember';
import layout from '../templates/components/m-image-sample';

export default Ember.Component.extend({
  layout,
  imageDownloadComplete: false,
  imageSrcChanged: true,
  showChangeImageSrcButton: Ember.computed.and('imageDownloadComplete', 'imageSrcChanged'),
  actions: {
    onStart: function () {
      this.set('message', 'Thank you for your patience ...');
    },
    onComplete: function () {
      this.set('message', 'Yo! I am here');
      this.set('imageDownloadComplete', true);
    },
    onError: function () {
      this.set('message', 'Ohh no! Something is wrong');
    },
    changeImageSrc: function () {
      this.set('imageSrc', this.get('secondImageSrc'));
      this.set('imageSrcChanged', false);
    }
  }
});
