import {moduleForComponent} from 'ember-qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import Ember from 'ember';

moduleForComponent('m-image', 'Unit | Component | m image', {
  unit: true,
  beforeEach: function () {
    const component = this.subject();
    component.preloaderImageSrc = 'http://preloader-image-url';
    component.fallbackImageSrc = 'http://error-image-url';
    component.src = 'http://image-url';
  },
  afterEach: function () {
    const component = this.subject();
    component.preloaderImageSrc = null;
    component.fallbackImageSrc = null;
    component.src = null;
  }
});

// --------------------------------------------------------------------------------------------------

sinonTest('should call the loadImage after element inserted', function (assert) {
  assert.expect(1);

  const component = this.subject();
  const loadImageStub = this.stub(component, 'loadImage');

  component.didInsertElement();

  assert.ok(loadImageStub.calledOnce, 'loadImage was called');
});

// --------------------------------------------------------------------------------------------------

sinonTest('should call the loadImage on src change', function (assert) {
  assert.expect(1);

  const component = this.subject();
  const loadImageStub = this.stub(component, 'loadImage');

  component.set('src', 'http://new-image-url');

  assert.ok(loadImageStub.calledOnce, 'loadImage was called');
});

// --------------------------------------------------------------------------------------------------

sinonTest('should load the image', function (assert) {
  assert.expect(7);

  const component = this.subject();

  component.set('loader', (src) => {
    assert.equal(src, 'http://image-url', 'loader was called with src');
    return new Ember.RSVP.Promise((resolve) => {
      return resolve(component.get('src'));
    })
  });

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

  return p;
});

// --------------------------------------------------------------------------------------------------

sinonTest('should handle error during loading of the image', function (assert) {
  assert.expect(7);

  const component = this.subject();

  const componentLoader = component.get('loader');
  const componentDomLoader = component.get('_domLoader');

  component.set('loader', () => {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return reject();
    })
  });

  component.set('_domLoader', (src) => {
    assert.equal(src, 'http://error-image-url', 'loader was called to load alternate image');
    return new Ember.RSVP.Promise((resolve) => {
      return resolve();
    });
  });

  let currentActionSent = '';
  const testPromise = (resolve) => {
    this.stub(component, 'sendAction').callsFake((action) => {
      currentActionSent = action;
      if (action === 'onLoadError') {
        assert.equal(component.get('imageStateCss'), 'error', 'imageStateCss was set to error');
        assert.equal(component.get('_imageSrc'), 'http://error-image-url', '_imageSrc was set to errorImageUrl');
        assert.ok(true, 'onLoadError action was sent');

        // restore component's mocked members
        component.set('loader', componentLoader);
        component.set('_domLoader', componentDomLoader);

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

  return p;
});

// --------------------------------------------------------------------------------------------------

sinonTest('should handle error during loading of the alternate image', function (assert) {
  assert.expect(4);

  const component = this.subject();

  const componentDomLoader = component.get('_domLoader');

  component.set('_domLoader', (src) => {
    assert.equal(src, 'http://error-image-url', 'loader was called to load alternate image');
    return new Ember.RSVP.Promise((resolve, reject) => {
      return reject();
    });
  });

  const testPromise = (resolve) => {
    this.stub(component, 'sendAction').callsFake((action) => {
      if (action === 'onLoadError') {
        assert.equal(component.get('imageStateCss'), 'error', 'imageStateCss was set to error');
        assert.equal(component.get('_imageSrc'), 'http://error-image-url', '_imageSrc was set to errorImageUrl');
        assert.ok(true, 'onLoadError action was sent');

        // restore component's mocked members
        component.set('_domLoader', componentDomLoader);

        resolve();
      }
    });
  };

  component.set('imageStateCss', 'loading');

  const p = new Ember.RSVP.Promise(testPromise);

  component._loadAlternateImage();

  return p;
});
