CoreMedia CKEditor 5 Link Plugin
================================================================================

This plugin extends the [CKEditor 5 Link Feature][cke5:docs:link:feature] in
several ways:

* **[LinkTarget Plugin](#linktarget-plugin):**

    Adds a configuration option for the `target` behavior to link editing.

* **LinkCoreMediaContent Plugin (planned):**

    Adds support for internal links within CoreMedia CMS.

For further information you will find more references at [the end](#see-also).

LinkTarget Plugin
--------------------------------------------------------------------------------
([Top](#_top))<a id="linktarget-plugin"></a>

The `LinkTarget` plugin adds support for a new model attribute `linkTarget` for
links. It integrates deeply with the
[CKEditor 5 Link Feature][cke5:docs:link:feature] and extends the corresponding
editing balloon by selection of a target behavior.

A post-fixer is installed for
[Document at model layer][cke5:api:engine.model.document.Document] which will
ensure, that on unlink, not only the `linkHref` provided by CKEditor's
`LinkCommand` is removed, but also any possibly orphaned `linkTarget`
attribute.

### LinkTarget Configuration

The `LinkTarget` plugin does not come with own configuration options. Thus, you
will just add it to the plugins to extend the link dialog automatically.

```javascript
ClassicEditor
    .create(document.querySelector('#editor'), {
        plugins: [
            // ...
            Link,
            CoreMediaStudioEssentials
        ],
        toolbar: {
            items: [
                // ...
                'link'
            ],
        },
        link: {
            // Configuration of CKEditor's link feature
        }
    })
    .then(...)
    .catch(...);
```

**⚠ Clashes with target-behavior of CKEditor 5 Link Feature**

It is important to note, that the `LinkTarget` plugin clashes with the
target behavior of CKEditor's Link Feature, and thus with decorators adding
a target attribute or with the feature `addTargetToExternalLinks`.

Thus, you must not use any of these features, when using the `LinkTarget` plugin.

### CoreMedia RichText DataProcessor Integration

The following is not part of the `LinkTarget` plugin, but included in the
CoreMedia RichText plugin. Having this, it is perfectly fine, if you do not
include the `LinkTarget` plugin, but use for example CKEditor's decorator
approach instead, as it will be automatically recognized by the RichText
plugin.

CoreMedia RichText 1.0 does not know about the `target` attribute. General
contract is, to model it with [XLink Attribute][w3:xlink] `xlink:show` and
`xlink:role`.

While in the original specification `xlink:role` is meant to hold only
[Legacy extended IRIs][w3:IRI] as values, it is used within CoreMedia CMS
to store any non-predefined target value, such as the name of a frame.

The general contract for mapping `target` attributes during RichText
data-processing is as follows:

| `xlink:show` | `xlink:role` | `target`    |
| ------------ | ------------ | ----------- |
| `new`        |              | `_blank`    |
| `replace`    |              | `_self`     |
| `embed`      |              | `_embed`    |
| `none`       |              | `_none`     |
| `other`      | `frameName`  | `frameName` |

Targets for `embed` and `none` are _artificial_ mappings, as if they were
defined as standard attribute values for the `target` attribute. This is
required, as the `target` attribute does not provide any alternative to
these states of `xlink:show`.

For other well-known values regarding the `target` attribute, these will be
mapped with `xlink:show="other"`:

| `xlink:show` | `xlink:role` | `target`    |
| ------------ | ------------ | ----------- |
| `other`      | `_parent`    | `_parent`   |
| `other`      | `_top`       | `_top`      |

Mappings in data processing should ensure, that more artificial states
(from CoreMedia CMS) perspective are also represented meaningfully.

A general recommendation is providing artificial targets for `xlink:show`
states, which are not expected to have a value in `xlink:role`. For example
if the CMS provides `xlink:show="replace" xlink:role="frameName"` it may
be represented as `_replace_frameName`.

This behavior is expected by the `LinkTargetUI` to provide a consistent UI state.
In more detail the following artificial states are recognized:

| `xlink:show` | `xlink:role` | `target`           |
| ------------ | ------------ | ------------------ |
| `new`        | `frameName`  | `_blank_frameName` |
| `replace`    | `frameName`  | `_self_frameName`  |
| `embed`      | `frameName`  | `_embed_frameName` |
| `none`       | `frameName`  | `_none_frameName`  |
| `other`      |              | `_other`           |
|              | `frameName`  | `_role_frameName`  |

### CKEditor 4 Behavior

Some details on the CKEditor 4 integration in CoreMedia Studio and its behavior
regarding different states of `xlink:show` and `xlink:role` are shown here.
It is important to note, that for CKEditor 4 we kept `xlink:show` and
`xlink:role` as extra _hidden_ attributes within CKEditor HTML and all actions
modifying these behaviors, knew about them.

For CKEditor 5 we decided to stick to the more generic `target` attribute as
representation within CKEditor. This makes it obsolete adding some special
paste handler transforming such target attributes.

See Also
--------------------------------------------------------------------------------
([Top](#_top))<a id="see-also"></a>

* **[Design Considerations](./DESIGN.md)**

    Some notes why these plugins got implemented in the given way.

* **[Manual Testing](./TESTING.md)**

    Notes for manual testing, which should be done on each CKEditor update.

<!-- ======================================================== [ References ] -->

[cke5:api:engine.model.document.Document]: <https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_document-Document.html> "Class Document (engine/model/document~Document) - CKEditor 5 API docs"
[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
[w3:xlink]: <https://www.w3.org/TR/xlink/> "XML Linking Language (XLink) Version 1.1"
[w3:IRI]: <https://www.w3.org/TR/leiri/> "Legacy extended IRIs for XML resource identification"
