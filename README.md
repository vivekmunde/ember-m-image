# ember-m-image

This [ember.js](https://emberjs.com/) package shows a nice ***loading message*** during the actual image download form the server and displays a ***fallback image*** or an ***error message*** in case of image download fails. Its always better to show a loading state instead of showing a blank image till the image gets downloaded or showing the image line by line as it gets downloaded from server. 

The component `{{m-image}}` can load the image using following approaches:

1. ***DOM*** approach (*default*) creates a temporary DOM image instance (referred as temporary-image in further read) in memory using the constructor `Image()`. Then the main image source url supplied in the parameter `src` is assigned to the `src` attribute of this temporary-image. 
The component listens to the standard DOM Element events `load` and `error` using the method [EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener),  on this temporary-image. 
The `load` event is fired after the image is successfully downloaded inside the temporary-image. The `load` event listener then assigns this image source url to the `src` attribute of the main image. 
If an error occurs during the image download then the `error` event is fired. The `error` event listener then assigns the error image source url supplied in the parameter `fallbackImageSrc` to the main image.
The `load` and `error` event listeners listening on `new Image()` are cleared using the method [EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) in the `willDestroyElement` hook of the component and also before creating a new DOM image using `new Image()`.
2. ***AJAX / Fetch*** approache use [jQuery AJAX](http://api.jquery.com/jquery.ajax/) / [fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) request to download the image. If the promise is resolved then the image-data received in the response is assigned to the `src` attribute of the image. If the promise is rejected then the error image supplied in the parameter `fallbackImageSrc` is assigned to the the `src` attribute of the image.

The component uses the same image tag to display all the following three states of the image: 

1. ***Loading*** state exists from the start of the image download till the image download complete. During this state the pre-loader image, image url supplied in the parameter `preloaderImageSrc`, is displayed in the image tag and the css class `loading` is applied to the image. An action `onLoadStart` is thrown at the beginning of this state.
2. ***Complete*** state appears after the successful completion of the image download and the image is displayed, using the image url in case of DOM approach and as a 64 bit encoded string in case of AJAX approach, in the `src` tag of the image. This state applies the css class `complete` to the image. An action `onLoadComplete` is thrown after download complete.
3. ***Error*** state appears after the image download request fails. This state displays the error image, image url supplied in the parameter `fallbackImageSrc`,  and the css class `error` is applied to the image. An action `onLoadError` is thrown at the end of this state.

The components makes the image download request at following two occasions: 

1. `didInsertElement`: Once `<img>` tag gets inserted in to the DOM
2. `src`: After first render, whenever the `src` value changes 

### Note 
Its important to note that the component `{{m-image}}` uses images to display the loading and error states. So the loading image i.e. `preloaderImageSrc` and error image i.e. `fallbackImageSrc` are expected to be very light weight images. Though the concept of using a loading-image/error-image to show state of another image, i.e. actual image getting downloaded, may sound a little weird, but the whole purpose of this plugin is to provide a simplest way to display image download state to user. And on the other hand, the loading image and error image are required to get downloaded only once by the browser, cached & reused/displayed.

## Parameters

 - **src**: image url, which gets downloaded  
 - **alt**: *[optional]* image alt text mapped to the alt attribute 
 - **class**: *[optional]* css class for the image 
 - **loader**: *[optional]* image loader to be used to download the image form source
 - **preloaderImageSrc**: url of the pre-loader/loading state image to be displayed during the actual image download 
 - **fallbackImageSrc**: url of the image to be shown if any error occurs during the actual image download, this parameter can be used as an fallback image
 - **onLoadStart**: *[optional]* action sent at the start of the loading state
 - **onLoadComplete**: *[optional]* action sent after successful download of the image
 - **onLoadError**: *[optional]* action sent after an error occurred in the download of the image


## Example

*Sample implementation available under directory tests/dummy/app, please check the details [Running](#running) to see the sample implmentation running demo.*

#### .hbs

```
{{m-image 
    alt='Avatar'
    src='https://xyz.com/img/user.png'
    class='m-image'   
    preloaderImageSrc='https://xyz.com/img/preloader-tiny.gif'
    fallbackImageSrc='https://xyz.com/img/error-small.png'
    onLoadStart='onStart'
    onLoadComplete='onComplete'
    onLoadError='onError'}}
```

#### .css

```
.m-image {
    -webkit-transition: opacity 2s;
    -moz-transition: opacity 2s;
    transition: opacity 2s;
    opacity: 0;
    max-height: 252px;
}
.m-image.loading,
.m-image.error {
    padding-top: 95px;
    padding-bottom: 95px;
    opacity: 0.7;
    height: auto;
}
.m-image.complete {
    opacity: 1;
}
```

#### .js

```
actions: {
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
}
```

## Image Loaders

Loaders are nothing but the way the image gets downloaded. Loader is the mechanism to donload the image form source. 
`m-image` provides loaders for **AJAX & Fetch approaches**. Each loader exports a default method which returns a function. This returned function should be passed to the `m-image` in as a `loader` param which will be called to load the image. The function returns a promise, whose resolver returns the standard data which is directly set as `src` attrubute of the image and rejector returns error.

## Loading images thourgh AJAX / Fetch call

Use of ones of these loaders when the image is to be displayed using a web api endpoint.

### AJAX loader

Available under `ember-m-image/utils/m-image-ajax-loader`, used to load images using **AJAX approach**. 

**Parameters**
- ***AJAX Settings***: *[optional]* The loader accepts one optional parameter as ajax settings, which will be used to call the image source.

*.js*
```
import mImageAjaxLoader from 'ember-m-image/utils/m-image-ajax-loader';
.
.
.
// convert the image data in to a string which will be set as src attribute of the image
convertToBase64(imageData) {
    const encodeToBase64 = function (r) { if (!Ember.isBlank(r)) { for (var a, t, c, h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", A = "", e = 0, f = r.length; e < f;) { if (a = 255 & r.charCodeAt(e++), e == f) { A += h.charAt(a >> 2), A += h.charAt((3 & a) << 4), A += "=="; break } if (t = r.charCodeAt(e++), e == f) { A += h.charAt(a >> 2), A += h.charAt((3 & a) << 4 | (240 & t) >> 4), A += h.charAt((15 & t) << 2), A += "="; break } c = r.charCodeAt(e++), A += h.charAt(a >> 2), A += h.charAt((3 & a) << 4 | (240 & t) >> 4), A += h.charAt((15 & t) << 2 | (192 & c) >> 6), A += h.charAt(63 & c) } return A } };
    return `data:image/png;base64, ${encodeToBase64(imageData)}`;
},

ajaxLoader: Ember.computed(function () {
    // call the ajax loader method with ajax settings
    // this will returns a loader function which will use the supplied ajax settings
    return mImageAjaxLoader({
        dataType: 'text image',
        converters: {
            'text image': this.convertToBase64.bind(this) // convert the received response data in to a string which will be set as src attribute of the image
        }
    });
})
```

*.hbs*
```
{{m-image 
    alt="Avatar" 
    loader=ajaxLoader 
    cssClass="m-image" 
    src="https://xyz.com/img-api?image=avatar.png" 
    preloaderImageSrc="./img/preloader.gif" 
    fallbackImageSrc="./img/error.png"}}
```

### Fetch loader

Available under `ember-m-image/utils/m-image-fetch-loader`, used to load images using **Fetch approach**. Fetch loader expects the response from the source as blob.

**Parameters**
- ***Fetch Init Settings***: *[optional]* The loader accepts one optional parameter as fetch init settings, which will be used to call the image source.

*.js*
```
import mImageFetchLoader from 'ember-m-image/utils/m-image-fetch-loader';
.
.
.
fetchLoader: Ember.computed(function () {
    // call the fetch loader method with fetch init settings
    // this will returns a loader function will use the supplied fetch init settings
    return mImageFetchLoader({ mode: 'cors' });
})
```
*.hbs*
```
{{m-image 
    alt="Avatar" 
    loader=fetchLoader 
    cssClass="m-image" 
    src="https://xyz.com/img-api?image=avatar.png" 
    preloaderImageSrc="./img/preloader.gif" 
    fallbackImageSrc="./img/error.png"}}
```

## Custom loader

The `m-image` is fully scalable to accept/consume any custom loader. And building a custom loader is like a cake walk, just that simple. Loader should be a function which accepts one parameter `src` i.e. image source, and which gets called by the `m-image` component. The loader should return a promise, whose resolver should return the data which can be set as `src` attribute of `<img>` and rejector need not return any error.

#### *.js*

    import Ember from 'ember';

    export default function fetchLoader(init) {

        return function loader(src) {
            return new Ember.RSVP.Promise((resolve, reject) => {

            const onError = (error) => {
                reject(error);
            }

            const onSuccess = (response) => {
                response.blob().then(function(blob) {
                    resolve(URL.createObjectURL(blob));
                })
                .catch(onerror);
            };

            return fetch(src, init || {})
                .then((response) => {
                if (response.ok) {
                    onSuccess(response);
                } else {
                    onError(response.json());
                }
                })
                .catch(onError);

            });
        }

    }

### Caution/Drawback
***AJAX & Fetch Approach***: In case of cached images, the component sends an AJAX request to the server and gets a HTTP 304 (Not modified) response and then uses original image. The standard `<img src='http://image-source-url'>` reduces this empty request to server. 
***AJAX Approach***: Browsers do not allow cross domain image downloads through AJAX unless either used as [JSONP](https://www.w3schools.com/js/js_json_jsonp.asp) or the server allows the requests through [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) settings.

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

