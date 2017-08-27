import Ember from 'ember';
import mImageAjaxLoader from 'dummy/utils/m-image-ajax-loader';
import { module, test } from 'qunit';

module('Unit | Utility | m image ajax loader');

// ------------------------------------------------------------------------------------------------

test('should load image', function (assert) {
  assert.expect(1);

  let loader = mImageAjaxLoader();

  const src = 'http://domain/image-api?image=abc.png',
    imageData = 'data:image/png;base64, aW1hZ2VCaW5hcnk=';

  const mockjaxHandlerId = Ember.$.mockjax({
    type: 'GET',
    url: src,
    status: 200,
    responseText: imageData
  });

  return loader(src).then((resultImageSrc) => {
    assert.equal(resultImageSrc, imageData, 'image data was returned');
    Ember.$.mockjax.clear(mockjaxHandlerId);
  });
});

// ------------------------------------------------------------------------------------------------

test('should use supplied settings to load image', function (assert) {
  assert.expect(1);

  const src = 'http://domain/image-api?image=abc.png',
    expectedImageData = 'data:image/png;base64, aW1hZ2VCaW5hcnk=';

  let loader = mImageAjaxLoader({
    mimeType: 'text/plain;',
    dataType: 'text image',
    converters: {
      'text image': function () {
        return `data:image/png;base64, aW1hZ2VCaW5hcnk=`;
      }
    }
  });

  const mockjaxHandlerId = Ember.$.mockjax({
    type: 'GET',
    url: src,
    status: 200,
    responseText: expectedImageData
  });

  return loader(src).then((resultImageSrc) => {
    assert.equal(resultImageSrc, expectedImageData, 'image data was returned');
    Ember.$.mockjax.clear(mockjaxHandlerId);
  });
});
