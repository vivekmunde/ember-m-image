import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('m-image', 'Integration | Component | m image', {
  integration: true
});

// ----------------------------------------------------------------------------------------------------------

test('should set the image attribute alt', function (assert) {
  assert.expect(1);

  this.render(hbs`{{m-image alt="one" src="./img/test.png" preloaderImageSrc="./img/preloader.gif" fallbackImageSrc="./img/error.png" class="m-image"}}`);

  return wait().then(() => {
    assert.equal(this.$('img').attr('alt'), 'one', 'alt attribute was set');
  });
});

// ----------------------------------------------------------------------------------------------------------

test('should set the image attribute class', function (assert) {
  assert.expect(1);

  this.render(hbs`{{m-image alt="one" src="./img/test.png" preloaderImageSrc="./img/preloader.gif" fallbackImageSrc="./img/error.png" class="m-image"}}`);

  return wait().then(() => {
    assert.ok(this.$('img').attr('class').indexOf('m-image') > -1, 'css-class m-image was set');
  });
});

// ----------------------------------------------------------------------------------------------------------

test('should display the loading image', function (assert) {
  assert.expect(2);

  this.render(hbs`{{m-image alt="one" src="./img/test.png" preloaderImageSrc="./img/preloader.gif" fallbackImageSrc="./img/error.png" class="m-image"}}`);

  assert.equal(this.$('img').attr('src'), './img/preloader.gif', 'image src was set to loading image');
  assert.ok(this.$('img').attr('class').indexOf('loading') > -1, 'css-class loading was set');

  return wait();
});

// ----------------------------------------------------------------------------------------------------------

test('should display the image loaded using external loader', function (assert) {
  assert.expect(3);

  const loader = function (src) {
    assert.equal(src, './img/test.png', 'loader was called with src');
    return Ember.RSVP.resolve('data:image/png;base64, aW1hZ2VCaW5hcnk=');
  };

  this.set('loader', loader);

  this.render(hbs`{{m-image loader=loader alt="one" src="./img/test.png" preloaderImageSrc="./img/preloader.gif" fallbackImageSrc="./img/error.png" class="m-image"}}`);

  return wait().then(() => {
    assert.equal(
      this.$('img').attr('src'),
      'data:image/png;base64, aW1hZ2VCaW5hcnk=',
      'image src was set');
    assert.ok(this.$('img').attr('class').indexOf('complete') > -1, 'css-class complete was set');
  });
});

// ----------------------------------------------------------------------------------------------------------

test('should display the image loaded using DOM', function (assert) {
  assert.expect(2);

  this.render(hbs`{{m-image alt="one" src="./img/test.png" preloaderImageSrc="./img/preloader.gif" fallbackImageSrc="./img/error.png" class="m-image"}}`);

  return wait().then(() => {
    return wait().then(() => {
      assert.equal(
        this.$('img').attr('src'),
        './img/test.png',
        'image src was set');
      assert.ok(this.$('img').attr('class').indexOf('complete') > -1, 'css-class complete was set');
    });
  });
});

// ----------------------------------------------------------------------------------------------------------

test('should display the error image on DOM error', function (assert) {
  assert.expect(2);

  this.render(hbs`{{m-image alt="one" src="./img/non-existing-image.png" preloaderImageSrc="./img/preloader.gif" fallbackImageSrc="./img/error.png" class="m-image"}}`);

  return wait().then(() => {
    return wait().then(() => {
      assert.equal(this.$('img').attr('src'), './img/error.png', 'image src was set to error image');
      assert.ok(this.$('img').attr('class').indexOf('error') > -1, 'css-class error was set');
    });
  });
});
