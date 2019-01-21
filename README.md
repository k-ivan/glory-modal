# Glory-modal
<p>
  <a href="https://www.npmjs.com/package/glory-modal"><img src="https://img.shields.io/npm/v/glory-modal.svg"></a>
  <a href="https://www.npmjs.com/package/glory-modal"><img src="https://img.shields.io/npm/l/glory-modal.svg"></a>
  <a href="https://www.npmjs.com/package/glory-modal"><img src="https://img.shields.io/npm/dt/glory-modal.svg"></a>
</p>
Modal dialog plugin inspired by <a href="https://getbootstrap.com/">Bootstrap</a> modal dialogs, written in pure JavaScript.

## Demo
[Demo](https://k-ivan.github.io/glory-modal/)

## Installation

### NPM
```sh
npm i glory-modal
```
or basic <a href="https://github.com/k-ivan/glory-modal/archive/master.zip">download</a>

## Use
Include the plugin styles
```html
<link rel="stylesheet" href="gmodal.css">
```
Or If you use SASS, you can import a sass source
```scss
@import './node_modules/glory-modal/src/scss/gmodal.scss';
```
We also need a simple markup
```html
<div class="gmodal" id="exampleModal" role="dialog" aria-labelledby="Modal">
  <div class="gmodal__dialog">
    <div class="gmodal__content">
      <div class="gmodal__header">
        <div class="gmodal__title">Modal</div>
        <button type="button" class="gmodal__close" data-gmodal="dismiss">
            <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.34 6.34l11.32 11.32m-11.32 0L17.66 6.34"/>
          </svg>
        </button>
      </div>
      <div class="gmodal__body">
        Some content
      </div>
      <div class="gmodal__footer">
        <button data-gmodal="dismiss">Close</button>
      </div>
    </div>
  </div>
</div>
```
Add the plugin to the page
```html
<script src="gmodal.js"></script>
```
or if you are using a module bundler
```js
import Gmodal from 'glory-modal';
```

Init plugin
```js
var modal = new Gmodal('#exampleModal', {
  stickySelectors: ['.fixed']
});
```

## Options
But we can also use advanced plugin options. Available options and their default values.
```js
new Gmodal(elem, {
  stickySelectors: [],
  animation: true,
  backdrop: true,
  closeBackdrop: true,
  keyboard: true
});
```
`elem` (string | HTMLElement)
  selector or element

`stickySelectors` (array)
  array with selectors (fixed elements will also be margin-right, the fixed element must have an automatic width for the indent to work)


`animation` (bool)
  modal animation

`backdrop` (bool)
  add backdrop

`closeBackdrop` (bool)
  close by clicking on the backdrop, only if the `backdrop: true`

`keyboard` (bool)
  Keyboard events

## Public methods
Public methods for working with the plugin

### `.open()`
This method open modal dialog

### `.close()`
This method close modal dialog.

### `.destroy()`
This method stops the plugin. To reinitialize, you need to call the constructor again.

## Events
Plugin provides an event for show|close modal
```js
var elem = document.querySelector('#modal');
var modal = new Gmodal(elem);

elem.addEventListener('gmodal:open', function(evt) {
  console.log(evt)
})
elem.addEventListener('gmodal:close', function(evt) {
  console.log(evt)
})
```
