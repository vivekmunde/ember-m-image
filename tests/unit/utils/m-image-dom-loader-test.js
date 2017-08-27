import Ember from 'ember';
import mImageDomLoader from 'dummy/utils/m-image-dom-loader';
import {module} from 'qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';

module('Unit | Utility | m image dom loader');

// ------------------------------------------------------------------------------------------------

sinonTest('should load image', function (assert) {
  assert.expect(9);

  let loader = mImageDomLoader();

  let loadEventCallBack = null, errorEventCallBack = null;

  const src = '/img/1.png';

  this.stub(Image.prototype, 'addEventListener').callsFake((event, callBack) => {
    if (event === 'load') {
      assert.ok(true, 'load event listner was set');
      assert.ok(callBack, 'load callBack was passed');
      loadEventCallBack = callBack;
    }
    if (event === 'error') {
      assert.ok(true, 'error event listner was set');
      assert.ok(callBack, 'error callBack was passed');
      errorEventCallBack = callBack;
    }
  });

  this.stub(Image.prototype, 'removeEventListener').callsFake((event, callBack) => {
    if (event === 'load') {
      assert.ok(true, 'load event listner was removed');
      assert.ok(callBack === loadEventCallBack, 'load callBack was removed');
    }
    if (event === 'error') {
      assert.ok(true, 'error event listner was removed');
      assert.ok(callBack === errorEventCallBack, 'error callBack was removed');
    }
  });

  Ember.run.later(
    this,
    () => {
      loadEventCallBack();
    },
    1000
  );

  return loader(src).then((resultImageSrc) => {
    assert.equal(resultImageSrc, src, 'src was returned');
  });
});

// ------------------------------------------------------------------------------------------------

sinonTest('should handle error during image loading', function (assert) {
  assert.expect(5);

  let loader = mImageDomLoader();

  let loadEventCallBack = null, errorEventCallBack = null;

  const src = '/img/1.png';

  this.stub(Image.prototype, 'addEventListener').callsFake((event, callBack) => {
    if (event === 'load') {
      loadEventCallBack = callBack;
    }
    if (event === 'error') {
      errorEventCallBack = callBack;
    }
  });

  this.stub(Image.prototype, 'removeEventListener').callsFake((event, callBack) => {
    if (event === 'load') {
      assert.ok(true, 'load event listner was removed');
      assert.ok(callBack === loadEventCallBack, 'load callBack was removed');
    }
    if (event === 'error') {
      assert.ok(true, 'error event listner was removed');
      assert.ok(callBack === errorEventCallBack, 'error callBack was removed');
    }
  });

  Ember.run.later(
    this,
    () => {
      errorEventCallBack();
    },
    1000
  );

  return loader(src).then(() => {}, () => {
    assert.ok(true, 'promise was rejected');
  });
});
