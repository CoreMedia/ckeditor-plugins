# CoreMedia Differencing Plugin

Other than possibly suggested by the plugin-name, this plugin does not take
care of calculating differences by itself. It is meant to ensure, that
differencing data as generated in CoreMedia Studio are forwarded to editing
view, so that CSS rules can be applied to it, to highlight changes, additions
and deletions.

## Installation

```text
pnpm install @coremedia/ckeditor5-coremedia-differencing
```

```javascript
import Differencing from "@coremedia/ckeditor5-coremedia-differencing/Differencing";

ClassicEditor.create(document.querySelector('#editor'), {
  plugins: [
    Differencing,
    /* ... */
  ],
}).then((editor) => {
  /* By default, plugin is not enabled. */
  newEditor.plugins.get("Differencing")?.activateDifferencing();
});
```

Note, that to ease set up of two CKEditors for the same with the same
configuration despite the `Differencing` plugin, the plugin is disabled
by default.

To enable it in certain context (like the differencing view in CoreMedia
Studio), you have to explicitly enable the plugin prior to loading the
augmented data from server.

## CoreMedia Server-Side Differencing

In CoreMedia Studio, differences of CoreMedia RichText are evaluated on the
server. The corresponding response is similar to this:

```xml
<div xmlns="http://www.coremedia.com/2003/richtext-1.0"
     xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
  <p>
    Lorem ipsum dolor sit amet,
    <strong class="color--red background-color--purple">
      <xdiff:span
              xdiff:class="diff-html-changed"
              xdiff:changes="&lt;b&gt;Strong&lt;/b&gt; style added with class color--red background-color--purple."
              xdiff:id="changed-diff-0">
        consectetuer
      </xdiff:span>
    </strong> adipiscing elit.</p>
</div>
```

The (yet) only relevant attributes used from server-side differencing are
`xdiff:class` applied to `xdiff:span` and `xdiff:changetype` applied to
image elements.

`xdiff:class` may have one of these values:

* **`diff-html-added`**

  Some elements (including text nodes) have been added.

* **`diff-html-changed`**

  Elements, text or element attributes have been changed.

* **`diff-html-removed`**

  Elements, text or element attributes have been removed.

* **`diff-html-conflict`**

  Difference could not be evaluated due to a conflicting change.


`xdiff:changetype` is used for images and its value may be one of these:

* **`diff-removed-image`**
* **`diff-added-image`**
* **`diff-conflict-image`**

The (yet) ignored attributes (but forwarded to editing view) are:

* `xdiff:id` could be used to jump between differences. It is unused yet.

* `xdiff:changes` contains a verbose (English only) description of the applied
changes. As we do not (yet) show these in UI, these are ignored.

* `xdiff:next` and `xdiff:previous`, which is meant to provide some navigation
  feature between the different differencing nodes. It contains references to
  the corresponding IDs.

### Artificial `xdiff:br`

Detecting added or removed newlines throughout the CKEditor view and model
hierarchy is at least challenging. To ease detecting such added or removed
newlines, the default data-processing for CoreMedia RichText 1.0 transforms
such added/removed newlines to `xdiff:br` elements. In this early processing
stage, they are easy to detect.

The `xdiff:br` elements otherwise hold the same attributes as any
`xdiff:span`, which is the element they originated from in the original
server response.

## CSS Styling

### xdiff:span

As `xdiff:span` is forwarded to editing view, it may be used for highlighting
changes, as for example:

```css
xdiff\:span[xdiff\:class="diff-html-added"] {
  color: rgba(92, 160, 63, 1);
  text-decoration: underline;
}
xdiff\:span[xdiff\:class="diff-html-removed"] {
  color: rgba(196, 19, 19, 1);
  text-decoration: line-through;
}
xdiff\:span[xdiff\:class="diff-html-changed"] {
  color: rgba(255, 255, 255, 1);
  background-color: rgba(92, 160, 63, 1);
}
xdiff\:span[xdiff\:class="diff-html-conflict"] {
  color: rgba(255, 255, 255, 1);
  background-color: rgba(196, 19, 19, 1);
}
```

### xdiff:br

As stated in the introduction, `<xdiff:br/>` is an artificial element. It gets
transformed from an empty `<xdiff:span/>` in the data-processing stage as
provided for CoreMedia RichText 1.0.

It is meant to be used to highlight added/removed newlines, for example as
follows:

```css
xdiff\:br[xdiff\:class="diff-html-added"]::before {
  /* Some symbol to represent a new-line character. */
  content: '↩';
  height: 16px;
  position: absolute;
  margin-left: 3px;
}
```

### img and xdiff:changetype

If applying rules to `<img>` elements, it is important to understand, that
CKEditor adds the corresponding `xdiff:changetype` to the surrounding element
of the image. For `ImageInline` plugin, this is some `<span>` having class
attribute `image-inline`, for images kept via General HTML Support (GHS), it
is a `<span>` with class attribute `html-object-embed`.

To support CKEditor with or without image plugin and possible fallback to
GHS, corresponding CSS rules may look like this:

```css
span.image-inline[xdiff\:changetype="diff-added-image"] > img,
span.html-object-embed[xdiff\:changetype="diff-added-image"] > img {
  box-sizing: border-box;
  outline: 2px solid rgba(92, 160, 63, 1) !important;
  outline-offset: -2px;
}
span.image-inline[xdiff\:changetype="diff-removed-image"] > img,
span.html-object-embed[xdiff\:changetype="diff-removed-image"] > img {
  box-sizing: border-box;
  outline: 2px solid rgba(196, 19, 19, 1) !important;
  outline-offset: -2px;
}
span.image-inline[xdiff\:changetype="diff-conflict-image"] > img,
span.html-object-embed[xdiff\:changetype="diff-conflict-image"] > img {
  box-sizing: border-box;
  outline: 4px dashed rgba(196, 19, 19, 1) !important;
  outline-offset: -4px;
}
```

## Assumptions

* A CKEditor showing differences is always in read-only mode.

* Any other attribute than `xdiff:class` are irrelevant. For a set of all
  allowed attributes, see [xdiff.xsd][].

## Requirements

* Differences must never be written back to server.

* Copying from differencing data to a standard CKEditor should strip the
  `xdiff:span` elements. This is most likely triggered by CKEditor itself,
  as for standard editors, the element `xdiff:span` should be unknown.

[xdiff.xsd]: <./xdiff.xsd> "XDiff Schema"
