import { moduleForComponent, test } from 'ember-qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import Ember from 'ember';

moduleForComponent('m-image', 'Unit | Component | m image', {
  unit: true,
  setup: function () {
    Ember.$.mockjax({
      url: 'http://image-url',
      status: 200,
      responseText: 'imageBinary'
    });
    Ember.$.mockjax({
      url: 'http://unknown-image-url',
      status: 404
    });
  },
  beforeEach: function () {
    const component = this.subject();
    component.preloaderImageSrc = 'http://preloader-image-url';
    component.errorImageSrc = 'http://error-image-url';
    component.imageSrc = 'http://image-url';
  },
  afterEach: function () {
    const component = this.subject();
    component.preloaderImageSrc = null;
    component.errorImageSrc = null;
    component.imageSrc = null;
  }
});

// --------------------------------------------------------------------------------------------------

sinonTest('it gets image data through ajax', function (assert) {
  assert.expect(2);

  const component = this.subject();

  const encodeImageDataStub = this.stub(component, 'encodeImageData').returns('base64string');

  return component.getImage('http://image-url').then((imageData) => {
    assert.ok(encodeImageDataStub.calledWith('imageBinary'), 'base64Encode was called with the imageBinary');
    assert.equal(imageData, 'base64string', 'imageData was returned');
  });
});

// --------------------------------------------------------------------------------------------------

test('it returns error for non-existing image url', function (assert) {
  assert.expect(1);

  const component = this.subject();

  return component.getImage('http://unknown-image-url').then(() => { }, () => {
    assert.ok(true, 'error was returned');
  });
});

// --------------------------------------------------------------------------------------------------

test('it encodes the image binary to base64 string', function (assert) {
  assert.expect(1);

  const component = this.subject();
  assert.equal(component.base64Encode('base64string'), 'YmFzZTY0c3RyaW5n', 'value was encoded to base64 string');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it calls base64Encode', function (assert) {
  assert.expect(2);

  const component = this.subject();
  const base64EncodeStub = this.stub(component, 'base64Encode').returns('base64string');

  assert.equal(component.encodeImageData('imageBinary'), 'base64string', 'imageData was encoded');
  assert.ok(base64EncodeStub.calledWith('imageBinary'), 'base64Encode was called with imageBinary');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it does not call base64Encode', function (assert) {
  assert.expect(1);

  const component = this.subject();
  component.set('encodeToBase64', false);
  this.stub(component, 'base64Encode').throws('base64Encode was called');

  assert.equal(component.encodeImageData('base64ImageString'), 'base64ImageString', 'imageData was not encoded');
});

// --------------------------------------------------------------------------------------------------

test('it returns image url extension', function (assert) {
  assert.expect(4);

  const component = this.subject()

  assert.equal(component.getImageSrcExtension('http://image-src.png'), 'png', 'extension = png');

  assert.equal(component.getImageSrcExtension('http://image-src.gif?version=98354'), 'gif', 'extension = gif');

  assert.equal(component.getImageSrcExtension('http://api/image-src'), '', 'extension = [blank]');

  assert.equal(component.getImageSrcExtension('http://api/image-src?version=823765'), '', 'extension = [blank]');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it loads the image', function (assert) {
  assert.expect(8);

  const component = this.subject();

  const getImageStub = this.stub(component, 'getImage').returns(new Ember.RSVP.Promise((resolve) => {
    return resolve('base64string');
  }));

  const getImageSrcExtensionStub = this.stub(component, 'getImageSrcExtension').returns('png');

  let currentActionSent = '';
  const testPromise = (resolve) => {
    this.stub(component, 'sendAction').callsFake((action) => {
      currentActionSent = action;
      if (action === 'onLoadComplete') {
        assert.ok(getImageSrcExtensionStub.calledWith('http://image-url'), 'imageSrc extension was retrieved');
        assert.equal(component.get('imageStateCss'), 'complete', 'imageStateCss was set to complete');
        assert.equal(component.get('_imageSrc'), 'data:image/png;base64, base64string', 'imageData was loaded');
        assert.ok(true, 'onLoadComplete action was sent');
        resolve();
      }
    });
  };

  component.addObserver('_imageSrc', () => {
    const _imageSrc = component.get('_imageSrc');
    if (_imageSrc === 'http://preloader-image-url') {
      assert.equal(component.get('imageStateCss'), 'loading', 'imageStateCss was set to loading');
      assert.equal(currentActionSent, 'onLoadStart', 'onLoadStart action was sent');
      assert.ok(true, '_imageSrc was set to preloaderImageUrl');
    }
  });

  const p = new Ember.RSVP.Promise(testPromise);

  component.loadImage();

  assert.ok(getImageStub.calledWith('http://image-url'), 'getImage was called with imageSrc');

  return p;
});

// --------------------------------------------------------------------------------------------------

sinonTest('it handles error during loading of the image', function (assert) {
  assert.expect(7);

  const component = this.subject();

  const getImageStub = this.stub(component, 'getImage').returns(new Ember.RSVP.Promise((resolve, reject) => {
    return reject();
  }));

  let currentActionSent = '';
  const testPromise = (resolve) => {
    this.stub(component, 'sendAction').callsFake((action) => {
      currentActionSent = action;
      if (action === 'onLoadError') {
        assert.equal(component.get('imageStateCss'), 'error', 'imageStateCss was set to error');
        assert.equal(component.get('_imageSrc'), 'http://error-image-url', '_imageSrc was set to errorImageUrl');
        assert.ok(true, 'onLoadError action was sent');
        resolve();
      }
    });
  };

  component.addObserver('_imageSrc', () => {
    const _imageSrc = component.get('_imageSrc');
    if (_imageSrc === 'http://preloader-image-url') {
      assert.equal(component.get('imageStateCss'), 'loading', 'imageStateCss was set to loading');
      assert.equal(currentActionSent, 'onLoadStart', 'onLoadStart action was sent');
      assert.ok(true, '_imageSrc was set to preloaderImageUrl');
    }
  });

  const p = new Ember.RSVP.Promise(testPromise);

  component.loadImage();

  assert.ok(getImageStub.calledWith('http://image-url'), 'getImage was called with imageSrc');

  return p;
});

// --------------------------------------------------------------------------------------------------

sinonTest('it calls the loadImage after element insert into DOM', function (assert) {
  assert.expect(1);

  const component = this.subject();
  const loadImageStub = this.stub(component, 'loadImage');

  component.didInsertElement();

  assert.ok(loadImageStub.calledOnce, 'loadImage was called');
});

sinonTest('it calls the loadImage on imageSrc change', function (assert) {
  assert.expect(1);

  const component = this.subject();
  const loadImageStub = this.stub(component, 'loadImage');

  component.set('imageSrc', 'http://new-image-url');

  assert.ok(loadImageStub.calledOnce, 'loadImage was called');
});
