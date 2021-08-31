# Link-Target Feature

The Link-Target Plugin extends [CKEditor's Link Feature][cke5:docs:link:feature]
by selection of a `target` attribute for an existing link. It is stored in model
as `linkTarget` attribute.

A document post-fixer exists, so that `linkTarget` attribute cannot exist
without `linkHref` attribute set. This ensures smooth integration into
CKEditor's link feature, as buttons for target selection will be added to
the `LinkActionsView` of CKEditor's link feature.

* [Integration][]
* [Configuration][]
  * [Default Configuration][]
    * [_self][]
    * [_blank][]
    * [_embed][]
    * [_other][]
  * [Advanced Configuration][]
* [CoreMedia RichText 1.0 Integration][]
  * [CKEditor 4 Behavior][]

## Integration

[Integration]: <#integration>

[[Top][]|[Integration][]|[Configuration][]|[RichText][]]

```typescript
import LinkTarget from "@coremedia/ckeditor5-link/linktarget/LinkTarget";

ClassicEditor
  .create(document.querySelector("#editor"), {
    plugins: {
      // ...
      LinkTarget,
    },
    // ...
    link: {
      targets: [
        // ...
      ],
    }
  })
  .then(...)
  .catch(...);
```

**Essentials Plugin:** This Plugin is part of CoreMedia Essentials Plugin.

## Configuration

[Configuration]: <#configuration>

[[Top][]|[Integration][]|[Configuration][]|[RichText][]]

The plugin can be configured as part of CKEditor's Link Feature configuration.

* [Default Configuration][]
* [Advanced Configuration][]

### Default Configuration

[Default Configuration]: <#default-configuration>

[[Top][]|[Up][Configuration]|[Default Configuration][]
|[Advanced Configuration][]]

The following example shows the default configuration, which is applied, if no
configuration is given:

```typescript
ClassicEditor
  .create(document.querySelector("#editor"), {
    // ...
    link: {
      targets: [
        "_self",
        "_blank",
        "_embed",
        "_other",
      ],
    }
  })
  .then(...)
  .catch(...);
```

It will create buttons in the `LinkActionsView` of CKEditor's Link Feature in
the order as given in the array:

| Target   | Label                 |
| -------- | --------------------- |
| `_self`  | _Open in Current Tab_ |
| `_blank` | _Open in New Tab_     |
| `_embed` | _Show Embedded_       |
| `_other` | _Open in Frame_       |

The buttons will be added just in front of the _Unlink_ button.

For customization, you may skip or reorder the targets according to your needs.

#### Predefined: _self

[_self]: <#predefined-_self>

[self]: <#predefined-_self>

[[Top][]|[Up][Default Configuration]|[_self][]|[_blank][]|[_embed][]|[_other][]]

This is the default state for unset `linkTarget` attribute in model. When
pressed, an explicit `linkTarget="_self"` will be applied to the model.

**Recommended:** If you skip this option, you may find none of the option
buttons being active for a newly created link, as new links will not be created
having a `linkTarget` attribute set.

#### Predefined: _blank

[_blank]: <#predefined-_blank>

[blank]: <#predefined-_blank>

[[Top][]|[Up][Default Configuration]|[_self][]|[_blank][]|[_embed][]|[_other][]]

This is the same as the standard HTML attribute value `_blank`.

#### Predefined: _embed

[_embed]: <#predefined-_embed>

[embed]: <#predefined-_embed>

[[Top][]|[Up][Default Configuration]|[_self][]|[_blank][]|[_embed][]|[_other][]]

This is an artificial target derived from `xlink:show="embed"` (and used by
CoreMedia RichText 1.0 for example, see [below][RichText]). It is represented
similar to the standard target names with an underscore as prefix.

#### Predefined: _other

[_other]: <#predefined-_other>

[other]: <#predefined-_other>

[[Top][]|[Up][Default Configuration]|[_self][]|[_blank][]|[_embed][]|[_other][]]

The name corresponds to `xlink:show="other"`. It represents any other value
of `linkTarget` which is not known by any of the other configured targets. If
pressed, an editor will pop up to specify any custom value for
`linkTarget` such as `my-named-frame`.

**Recommended:** It is strongly recommended adding at least `_other` to your
configuration, as it serves as fallback for any otherwise unknown value of
`linkTarget`. Thus, if your model includes `linkTarget="_self"` without `_self`
being part of your configuration, this option will become active and provide an
editor containing `_self` as text.

> **To-Do:**
>
> We need to discuss the following behavior. We may decide in two ways for
> empty text in _Open in Frame_ dialog:
>
> 1. **Delete:** Use it to signal to delete the target-attribute completely.
     > This would activate the _Open in Current Tab_ button after saving, while
     > the model does not contain a `linkTarget` attribute yet. Only, if you
     > press _Open in Current Tab_ you will trigger that `_self` is explicitly
     > stored to the model.
>
> 2. **Artificial State:** We may also decide, to make this an artificial state.
     > This would match the current behavior of CKEditor 4. In the model, we
     > would apply `_other` as artificial target value. Reopening the
     > _Open in Frame_ editor may be surprising, as the text will be empty,
     > although the button was marked as active before.
>
> If we decide on option (1) we should add an extra paragraph about the
> deletion behavior.

**Corner Case:** `linkTarget="_other"` may be generated by CoreMedia RichText
1.0 integration (see [below][RichText]). It represents an artificial state
having `xlink:show="other"` without expected `xlink:role`
attribute.

In the UI of `LinkTarget` plugin, this is represented with active button
_Open in Frame_ but with empty text in the corresponding editor. As an empty
text signals deleting the target attribute, closing the editor with _Save_ in
this state, will remove `_other` as attribute value.

### Advanced Configuration

[Advanced Configuration]: <#advanced-configuration>

[[Top][]|[Up][Configuration]|[Default Configuration][]
|[Advanced Configuration][]]

You may add any custom button for predefined `linkTarget` values. For example to
support standard HTML option values `_top` and `_parent` you may add them to the
configuration just as all other options:

```typescript
ClassicEditor
  .create(document.querySelector("#editor"), {
    // ...
    link: {
      targets: [
        "_parent",
        "_top",
        "_other",
      ],
    }
  })
  .then(...)
  .catch(...);
```

Note, that, as no icons are configured for these targets, the button labels will
just contain the plain text value.

You may configure custom icons by adding SVGs or referencing SVGs:

```typescript
import parentIcon from 'path/to/parentIcon.svg';

ClassicEditor
  .create(document.querySelector("#editor"), {
    // ...
    link: {
      targets: [
        {
          name: "_parent",
          icon: parentIcon,
        },
        {
          name: "_top",
          icon: "<svg ...>...</svg>",
          title: "Open at topmost browsing context"
        },
        "_other",
      ],
    }
  })
  .then(...)
  .catch(...);
```

**title:** As can be seen in the example, you may also provide a text for the
tooltip. The text is handed over to `Locale.t()` for translation, so that you
may provide labels translated to your UI language.

The title defaults to the name of the target option if unset.

## CoreMedia RichText 1.0 Integration

[CoreMedia RichText 1.0 Integration]: <#coremedia-richtext-10-integration>

[RichText]: <#coremedia-richtext-10-integration>

[[Top][]|[Integration][]|[Configuration][]|[RichText][]]

The following is not part of the `LinkTarget` plugin, but included in the
CoreMedia RichText plugin. Having this, it is perfectly fine, if you do not
include the `LinkTarget` plugin, but use for example CKEditor's decorator
approach instead, as it will be automatically recognized by the RichText plugin.

CoreMedia RichText 1.0 does not know about the `target` attribute. General
contract is, to model it with [XLink Attribute][w3:xlink] `xlink:show` and
`xlink:role`.

While in the original specification `xlink:role` is meant to hold only
[Legacy extended IRIs][w3:IRI] as values, it is used within CoreMedia CMS to
store any non-predefined target value, such as the name of a frame.

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
required, as the `target` attribute does not provide any alternative to these
states of `xlink:show`.

**_none:** Note, that `_none` is not one of the default targets provided by
`LinkTarget` plugin. If you want to support it, you may add it as part of
the [Advanced Configuration][].

For other well-known values regarding the `target` attribute, these will be
mapped with `xlink:show="other"`:

| `xlink:show` | `xlink:role` | `target`    |
| ------------ | ------------ | ----------- |
| `other`      | `_parent`    | `_parent`   |
| `other`      | `_top`       | `_top`      |

Mappings in data processing should ensure, that more artificial states
(from CoreMedia CMS) perspective are also represented meaningfully.

A general recommendation is providing artificial targets for `xlink:show`
states, which are not expected to have a value in `xlink:role`. For example if
the CMS provides `xlink:show="replace" xlink:role="frameName"` it may be
represented as `_self_frameName`, where `_self` is the default mapping for
`replace`.

The following artificial states may occur:

| `xlink:show` | `xlink:role` | `target`           |
| ------------ | ------------ | ------------------ |
| `new`        | `frameName`  | `_blank_frameName` |
| `replace`    | `frameName`  | `_self_frameName`  |
| `embed`      | `frameName`  | `_embed_frameName` |
| `none`       | `frameName`  | `_none_frameName`  |
| `other`      |              | `_other`           |
|              | `frameName`  | `_role_frameName`  |

Without further configuration, `LinkTarget` plugin will assume the values to be
custom targets just as any other unmatched string. Just as for `_none` you may
decide to provide an [Advanced Configuration][] for these combined targets.

### CKEditor 4 Behavior

[CKEditor 4 Behavior]: <#ckeditor-4-behavior>

[CKEditor 4]: <#ckeditor-4-behavior>

[[Top][]|[Up][RichText]|[CKEditor 4][]]

Some details on the CKEditor 4 integration in CoreMedia Studio and its behavior
regarding different states of `xlink:show` and `xlink:role` are shown here. It
is important to note, that for CKEditor 4 we kept `xlink:show` and
`xlink:role` as extra _hidden_ attributes within CKEditor HTML and all actions
modifying these behaviors, knew about them.

For CKEditor 5 we decided to stick to the more generic `target` attribute as
representation within CKEditor. This makes it obsolete adding some special paste
handler transforming such target attributes for example on copy and paste from
external sources.

<!-- ======================================================== [ References ] -->

[Top]: <#top>

[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"

[w3:xlink]: <https://www.w3.org/TR/xlink/> "XML Linking Language (XLink) Version 1.1"

[w3:IRI]: <https://www.w3.org/TR/leiri/> "Legacy extended IRIs for XML resource identification"
