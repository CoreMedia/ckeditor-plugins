CoreMedia CKEditor 5 Images
================================================================================

### General Information

The `ckeditor5-coremedia-images` package is responsible for showing and editing images in CoreMedia RichText.

### Plugins:

* ContentImageEditingPlugin
* ContentImageClipboardPlugin
* ModelBoundSubscriptionPlugin

**ContentImageEditingPlugin**

Plugin to support images from CoreMedia RichText.

**ContentImageClipboardPlugin**

Plugin that registers a creator function to support images in the **ContentClipboard** plugin.

**ModelBoundSubscriptionPlugin**

Plugin to register active subscriptions for cleanup.

### Attributes for Images from RichText and mappings to model/view/data-view

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

