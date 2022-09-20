# CoreMedia CKEditor 5 Images

## General Information

The `ckeditor5-coremedia-images` package is responsible for showing and editing
images in CoreMedia RichText.

## Installation

```text
pnpm install @coremedia/ckeditor5-coremedia-images
```

```javascript
ClassicEditor.create(document.querySelector('#editor'), {
  plugins: [
    ContentImagePlugin,
    /* ... */
  ],
}).then((editor) => {
  /* ... */
});
```

Note, that you most likely will also install some of CKEditor's image plugins.

## Plugins

* `ContentImagePlugin`

  Aggregator plugin for:

  * `ContentImageEditingPlugin`
  * `ContentImageClipboardPlugin`

* `ContentImageEditingPlugin`

  Plugin to support images from CoreMedia RichText. 

* `ContentImageClipboardPlugin`

  Plugin that registers a creator function to support images in the `ContentClipboard` plugin.

* `ModelBoundSubscriptionPlugin`

  Plugin to register active subscriptions for cleanup. Controlled by
  `ContentImageEditingPlugin`.

## Attributes for Images from RichText and mappings to model/view/data-view

Note, that the representation in model depends on the installed plugins.
If model elements are provided by _General RichText Support_ (based on
CKEditor's General HTML support), it most likely means, that a corresponding
plugin to edit this attribute has not been installed.

| Data            | Data-View            | Model                 | Plugin                     | Data Example                              |
|-----------------|----------------------|-----------------------|----------------------------|-------------------------------------------|
| `alt`           | `alt`                | htmlAttributes by GRS | default                    | `alt="Some Alternative"`                  |
| `dir`           | `dir`                | htmlAttributes by GRS | GeneralRichTextPlugin      | `dir="ltr"`                               |
| `xlink:actuate` | `data-xlink-actuate` | htmlAttributes by GRS | GeneralRichTextPlugin      | `xlink:actuate="onLoad"`                  |
| `xlink:href `   | `data-xlink-href`    | `xlink-href`          | ContentImageEditingPlugin  | `xlink:href="content/42#properties.data"` | 
| `xlink:role`    | `data-xlink-role`    | htmlAttributes by GRS | GeneralRichTextPlugin      | `xlink:role="https://example.org/"`       | 
| `xlink:show`    | `data-xlink-show`    | htmlAttributes by GRS | GeneralRichTextPlugin      | `xlink:show="embed"`                      |
| `xlink:title`   | `title`              | htmlAttributes by GRS | GeneralRichTextPlugin      | `xlink:title="All Attributes"`            | 
| `xlink:type`    | `data-xlink-type`    | htmlAttributes by GRS | GeneralRichTextPlugin      | `xlink:type="simple"`                     |
| `class`         | `class`              | htmlAttributes by GRS | GeneralRichTextPlugin      | `class="grs xmp"`                         |
| `xml:lang`      | `lang`               | htmlAttributes by GRS | GeneralRichTextPlugin      | `xml:lang="en"`                           |
| `height`        | `height`             | htmlAttributes by GRS | GeneralRichTextPlugin      | `height="48"`                             |
| `width`         | `width`              | htmlAttributes by GRS | GeneralRichTextPlugin      | `width="48"`                              |
