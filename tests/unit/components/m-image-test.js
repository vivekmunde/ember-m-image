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

  const convertToBase64ImageSrcStub = this.stub(component, 'convertToBase64ImageSrc').returns('base64string');

  return component.getImageUsingAjax('http://image-url').then((imageData) => {
    assert.ok(convertToBase64ImageSrcStub.calledWith('http://image-url', 'imageBinary'), 'base64Encode was called with the imageBinary');
    assert.equal(imageData, 'base64string', 'imageData was returned');
  });
});

// --------------------------------------------------------------------------------------------------

test('it returns error for non-existing image url', function (assert) {
  assert.expect(1);

  const component = this.subject();

  return component.getImageUsingAjax('http://unknown-image-url').then(() => { }, () => {
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

test('it returns image url extension', function (assert) {
  assert.expect(4);

  const component = this.subject()

  assert.equal(component.getImageSrcExtension('http://image-src.png'), 'png', 'extension = png');

  assert.equal(component.getImageSrcExtension('http://image-src.gif?version=98354'), 'gif', 'extension = gif');

  assert.equal(component.getImageSrcExtension('http://api/image-src'), '', 'extension = [blank]');

  assert.equal(component.getImageSrcExtension('http://api/image-src?version=823765'), '', 'extension = [blank]');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it returns encoded image data with image extension', function (assert) {
  assert.expect(3);

  const component = this.subject();
  const base64EncodeStub = this.stub(component, 'base64Encode').returns('base64string');
  const getImageSrcExtensionStub = this.stub(component, 'getImageSrcExtension').returns('png');

  assert.equal(component.convertToBase64ImageSrc('http://image.png', 'imageBinary', true), 'data:image/png;base64, base64string', 'base64 encoded imageSrc was returned');
  assert.ok(base64EncodeStub.calledWith('imageBinary'), 'base64Encode was called with imageBinary');
  assert.ok(getImageSrcExtensionStub.calledWith('http://image.png'), 'getImageSrcExtension was called with imageSrc');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it returns encoded image data without converting to base64 format', function (assert) {
  assert.expect(3);

  const component = this.subject();
  const base64EncodeStub = this.stub(component, 'base64Encode').returns('base64string');
  const getImageSrcExtensionStub = this.stub(component, 'getImageSrcExtension').returns('png');

  assert.equal(component.convertToBase64ImageSrc('http://image.png', 'base64string', false), 'data:image/png;base64, base64string', 'base64 encoded imageSrc was returned');
  assert.ok(base64EncodeStub.notCalled, 'base64Encode was not called');
  assert.ok(getImageSrcExtensionStub.calledWith('http://image.png'), 'getImageSrcExtension was called with imageSrc');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it returns encoded image data without image extension', function (assert) {
  assert.expect(3);

  const component = this.subject();
  const base64EncodeStub = this.stub(component, 'base64Encode').returns('base64string');
  const getImageSrcExtensionStub = this.stub(component, 'getImageSrcExtension').returns('');

  assert.equal(component.convertToBase64ImageSrc('http://image-src', 'imageBinary', true), 'data:image;base64, base64string', 'base64 encoded imageSrc was returned');
  assert.ok(base64EncodeStub.calledWith('imageBinary'), 'base64Encode was called with imageBinary');
  assert.ok(getImageSrcExtensionStub.calledWith('http://image-src'), 'getImageSrcExtension was called with imageSrc');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it loads the image using ajax', function (assert) {
  assert.expect(7);

  const component = this.subject();
  component.set('useAjax', true);
  component.set('ajaxOptions', { crossDomain: true });
  component.set('encodeToBase64', false);

  const getImageStub = this.stub(component, 'getImageUsingAjax').returns(new Ember.RSVP.Promise((resolve) => {
    return resolve('data:image/png;base64, base64string');
  }));

  let currentActionSent = '';
  const testPromise = (resolve) => {
    this.stub(component, 'sendAction').callsFake((action) => {
      currentActionSent = action;
      if (action === 'onLoadComplete') {
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

  assert.ok(getImageStub.calledWith('http://image-url', false, { crossDomain: true }), 'getImage was called with imageSrc, encodeToBase64 flag & ajaxOptions');

  return p;
});

// --------------------------------------------------------------------------------------------------

sinonTest('it handles error during ajax-loading of the image', function (assert) {
  assert.expect(7);

  const component = this.subject();
  component.set('useAjax', true);

  const getImageStub = this.stub(component, 'getImageUsingAjax').returns(new Ember.RSVP.Promise((resolve, reject) => {
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

  assert.ok(getImageStub.calledWith('http://image-url', true), 'getImage was called with imageSrc & encodeToBase64 flag');

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

// --------------------------------------------------------------------------------------------------

sinonTest('it loads the image using DOM', function (assert) {
  assert.expect(7);

  const component = this.subject();

  const getImageStub = this.stub(component, 'getImageUsingDOM').returns(new Ember.RSVP.Promise((resolve) => {
    return resolve(component.get('imageSrc'));
  }));

  let currentActionSent = '';
  const testPromise = (resolve) => {
    this.stub(component, 'sendAction').callsFake((action) => {
      currentActionSent = action;
      if (action === 'onLoadComplete') {
        assert.equal(component.get('imageStateCss'), 'complete', 'imageStateCss was set to complete');
        assert.equal(component.get('_imageSrc'), 'http://image-url', 'imageData was loaded');
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

sinonTest('it handles error during DOM-loading of the image', function (assert) {
  assert.expect(7);

  const component = this.subject();

  const getImageStub = this.stub(component, 'getImageUsingDOM').returns(new Ember.RSVP.Promise((resolve, reject) => {
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

sinonTest('it destroys temporary image', function (assert) {
  assert.expect(3);

  const component = this.subject();
  component.set('_img', {
    domElement: new Image(),
    eventListeners: {
      load: () => { },
      error: () => { }
    }
  });

  this.stub(component.get('_img.domElement'), 'removeEventListener').callsFake((eventName, listener) => {
    if (eventName === 'load') {
      assert.equal(listener, component.get('_img.eventListeners.load'), 'loadEventListener was removed');
    }
    if (eventName === 'error') {
      assert.equal(listener, component.get('_img.eventListeners.error'), 'errorEventListener was removed');
    }
  });

  component.destroyTemporaryDOM();

  assert.equal(component.get('_img'), null, '_img was set to null');
});

// --------------------------------------------------------------------------------------------------

sinonTest('it calls destroyTemporaryDOM', function (assert) {
  assert.expect(1);

  const component = this.subject();
  const removeStub = this.spy(component, 'destroyTemporaryDOM');

  component.willDestroyElement();

  assert.ok(removeStub.calledOnce, 'destroyTemporaryDOM was called');
});
