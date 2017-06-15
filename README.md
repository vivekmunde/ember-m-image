# ember-m-image

This [ember.js](https://emberjs.com/) package shows a nice ***loading message*** during the actual image download form the server and displays an ***alternate image*** or an ***error message*** in case of image download fails. Its always better to show a loading state instead of showing a blank image till the image gets downloaded or showing the image line by line as it gets downloaded from server. 

The component `{{m-image}}` loads the image using following two approaches:

 1. ***DOM*** approach creates a temporary DOM image instance (referred as temporary-image in further read) in memory using the constructor `Image()`. Then the main image source url supplied in the parameter `imageSrc` is assigned to the `src` attribute of this temporary-image. 
The component listens to the standard DOM Element events `load` and `error` using the method [EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener),  on this temporary-image. 
The `load` event is fired after the image is successfully downloaded inside the temporary-image. The `load` event listener then assigns this image source url to the `src` attribute of the main image. 
If an error occurs during the image download then the `error` event is fired. The `error` event listener then assigns the error image source url supplied in the parameter `errorImageSrc` to the main image.
The `load` and `error` event listeners listening on `new Image()` are cleared using the method [EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) in the `willDestroyElement` hook of the component and also before creating a new DOM image using `new Image()`.
 2. ***AJAX*** approach uses [jQuery AJAX](http://api.jquery.com/jquery.ajax/) request to download the image. If the AJAX promise is resolved then the image-data received in the AJAX response is assigned to the `src` attribute of the image. If the promise is rejected then the error image supplied in the parameter `errorImageSrc` is assigned to the the `src` attribute of the image.
 
The component uses the same image tag to display all the following three states of the image: 

 1. ***Loading***: This state exists from the start of the image download till the image download complete. During this state the pre-loader image, image url supplied in the parameter `preloaderImageSrc`, is displayed in the image tag and the css class `loading` is applied to the image. An action `onLoadStart` is thrown at the beginning of this state.
 2. ***Complete***: This state appears after the successful completion of the image download and the image is displayed, using the image url in case of DOM approach and as a 64 bit encoded string in case of AJAX approach, in the `src` tag of the image. This state applies the css class `complete` to the image. An action `onLoadComplete` is thrown after download complete.
 3. ***Error***: This state appears after the image download request fails. This state displays the error image, image url supplied in the parameter `errorImageSrc`,  and the css class `error` is applied to the image. An action `onLoadError` is thrown at the end of this state.

The components makes the image download request at following two occasions: 

 1. `didInsertElement`: Once `<img>` tag gets inserted in to the DOM
 2. `imageSrc`: After first render, whenever the `imageSrc` value changes 

### Note 
Its important to note that the component `{{m-image}}` uses images to display the loading and error states. So the loading image i.e. `preloaderImageSrc` and error image i.e. `errorImageSrc` are expected to be very light weight images. Though the concept of using a loading-image/error-image to show state of another image, i.e. actual image getting downloaded, may sound a little weird, but the whole purpose of this plugin is to provide a simplest way to display image download state to user. And on the other hand, the loading image and error image are required to get downloaded only once by the browser, cached & reused/displayed.

### Parameters

 - **alt**: image alt text mapped to the alt attribute 
 - **imageSrc**: image url, which gets downloaded  
 - **class**: css class for the image 
 - **preloaderImageSrc**: url of the pre-loader/loading state image to be displayed during the actual image download 
 - **errorImageSrc**: url of the image to be shown if any error occurs during the actual image download, this parameter can be used as an alternate image
 - **onLoadStart**: action sent at the start of the loading state
 - **onLoadComplete**: action sent after successful download of the image
 - **onLoadError**: action sent after an error occurred in the download of the image
 - **useAjax**: *default:false* | If false then DOM approach is used and if true then AJAX approach is used to download the image
 - **encodeToBase64**: *default:true* | if true the the data received by the AJAX GET request for the image will get encoded to base64 string. Mention false if base 64 encoding is not required, in case of an API returning the image as base64 encoded string
 - **ajaxOptions**: Configurable [jQuery AJAX](http://api.jquery.com/jquery.ajax/) options, except `type`, `url`, `success` and `error`

### Example

#### .hbs

    {{m-image 
      alt='Avatar'
      imageSrc='https://xyz.com/img/user.png'
      class='m-image'   
      preloaderImageSrc='https://xyz.com/img/preloader-tiny.gif'
      errorImageSrc='https://xyz.com/img/error-small.png'
      onLoadStart='onStart'
      onLoadComplete='onComplete'
      onLoadError='onError'}}

#### .css

    .m-image {
        -webkit-transition: opacity 2s;
        -moz-transition: opacity 2s;
        transition: opacity 2s;
        opacity: 0;
    }
    .m-image.loading {
        margin-top: 96px;
        margin-bottom: 96px;
        opacity: 0.5;
        height: auto;
    }
    .m-image.error {
        margin-top: 87px;
        margin-bottom: 86px;
        opacity: 0.7;
        height: auto;
    }
    .m-image.complete {
        opacity: 1;
        max-height: 252px;
    }

#### .js

    import Ember from 'ember';
    
    export default Ember.Component.extend({
      actions:
        onStart: () => {
          // code on image download start 
        },
        onComplete: () => {
          // code on image download complete
          // like, displaying some information text at the bottom of the image 
        },
        onError: () => {
          // code on image download error
          // like, display a button to report the issue 
        }
    });

### Caution/Drawback
***AJAX Approach***: In case of cached images, the component sends an AJAX request to the server and gets a HTTP 304 (Not modified) response and then uses original image. The standard `<img src='http://image-source-url'>` reduces this empty request to server. 
Also, browsers do not allow cross domain image downloads through AJAX unless the server allows the requests through [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) settings.

## Installation

* `ember install ember-m-image`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## The MIT License (MIT)

Copyright (c) 2017

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

