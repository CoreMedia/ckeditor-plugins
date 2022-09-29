# CKEditor 5 Plugin: CoreMedia Richtext 1.0 DataProcessor

[![API Documentation][badge:docs:api]][api:ckeditor-plugins]

This plugin is required to edit
[CoreMedia Richtext 1.0](coremedia-richtext-1.0.dtd),
an XML format, which provides a subset of XHTML features.

It grants conversion of CoreMedia RichText 1.0 to the CKEditor data model
as well as conversion from CKEditor data model to CoreMedia RichText.

To perform this transformation, this plugin provides a
[CKEditor 5 DataProcessor](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_dataprocessor-DataProcessor.html).

## Installation

```text
pnpm install @coremedia/ckeditor5-coremedia-richtext
```

```javascript
import CoreMediaRichText
  from '@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText';

ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    // ...
  ],
});
```

This will set the data processor of this editor instance to
`RichTextDataProcessor`.

## Configuration

The configuration key for CoreMedia RichText Plugin is `coremedia:richtext`.

### Strictness

```javascript
import {Strictness} from "@coremedia/ckeditor5-coremedia-richtext/RichTextSchema";
```

The strictness configures the behavior of the `toData` processing. It defaults
to `STRICT`. Changing the strictness may be required for dealing with legacy
contents stored in CoreMedia CMS.

The following modes exist:

* **`STRICT` enforces completely valid CoreMedia RichText 1.0.**

  In addition to `LOOSE` it will check for _meant to be_, such as a type
  called `Number` which states to be numbers only, but regarding the schema
  allows any (unchecked) character data. For `STRICT`
  non-numbers will be rated invalid.

* **`LOOSE` will only check, what the scheme will detect.**

  Given the example about numbers for `STRICT` mode, `LOOSE` will cause to
  accept any character data.

  **This is the safest mode to use**, when dealing with legacy contents, as for
  example number attributes may contain non-numbers and still passed the DTD
  validation.

* **`LEGACY` simulates the CKEditor 4 RichText Data Processing Behavior.**

  For CKEditor 4 the CoreMedia RichText data processing did not check for valid
  attribute values. It only checked for valid and required attribute names.

  If your extensions towards CKEditor 4 requires this behavior, you may enable
  this legacy mode. Note though, that the generated XML may be invalid regarding
  CoreMedia RichText 1.0 DTD. Most likely, you used this approach storing data
  into a content property having a different grammar.

#### Example Configuration

```javascript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    // ...
  ],
  "coremedia:richtext": {
    strictness: Strictness.LOOSE,
  },
});
```

### Data Processing Rules for Elements

As soon as you add a plugin, which supports an additional markup, you most
likely need to adapt data processing, i.e., transformation between CKEditor's
HTML and CoreMedia RichText 1.0.

The [Highlight Plugin][highlight] for example adds a [`<mark>`][mark] element to
HTML, which is not supported by CoreMedia RichText 1.0. You now have to model
two mappings:

1. **toData:** from HTML to CoreMedia RichText 1.0, and
2. **toView:** from CoreMedia RichText 1.0 to HTML.

An example configuration for the Highlight plugin will add the following
mapping:

1. **toData:**

   * from: `<mark class="marker-green">highlighted</mark>`
   * to: `<span class="mark marker-green">highlighted</span>`

2. **toView:**

   * from: `<span class="mark marker-green">highlighted</span>`
   * to: `<mark class="marker-green">highlighted</mark>`

> **Note: `mark` becomes a reserved class:**
>
> Applying the given mapping will declare `mark` as _reserved class_, which
> is, that it has some restrictions apply to this class, like the data
> must not contain ambiguous reserved classes. For details see the
> corresponding section below.

As configuration:

```javascript
import CoreMediaRichText
  from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText";
import GeneralRichTextSupport
  from "@coremedia/ckeditor5-coremedia-richtext-support/GeneralRichTextSupport";
import {replaceByElementAndClassBackAndForth}
  from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceBy";

/* ... */

ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    GeneralRichTextSupport,
    // ...
  ],
  "coremedia:richtext": {
    rules: {
      elements: {
        mark: replaceByElementAndClassBackAndForth("mark", "span", "mark"),
      },
    },
  },
});
```

As you see, you define the new rules in a section called `rules` and as we will
map elements here, you use the keyword `elements` to define the mapping rules.

The definition is (mostly) from data view: _Given an HTML element `<mark>`, how
do I map it to a corresponding representation in CoreMedia RichText 1.0?_
That's why the mapping keys are added with the name of the element.

`replaceByElementAndClassBackAndForth` provides a typical mapping, where
an element gets replaced by a `<span>` with an identifying class attribute
value.

This convenience function may be expanded, which will provide more details
on the data processing:

```javascript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    GeneralHtmlSupport,
    GeneralRichTextSupport,
    // ...
  ],
  "coremedia:richtext": {
    rules: {
      elements: {
        mark: {
          toData: (params) => {
            const { node } = params;
            node.name = "span";
            node.classList.add("mark");
          },
          toView: {
            span: (params) => {
              const { node } = params;
              if (!node.classList.contains("mark")) {
                // It's another span, we are not responsible.
                return;
              }
              node.classList.remove("mark");
              node.name = "mark";
            },
          },
        },
      },
    },
  },
});
```

Most of the time, you need to configure both directions (`toData` and `toView`).
Exceptions exist, and can be modelled, but are not part of this description.

Let's have a look at the `toData` mapping first:

```javascript
mark: {
  toData: (params) => {
    const { node } = params;
    node.name = "span";
    node.classList.add("mark");
  }
}
```

You define a mapping function, which receives `ElementFilterParams` as input.
The interface knows the following properties:

* **node:** Access to the DOM node to map, represented as `ElementProxy`.

* **parentRule:** A possibly existing parent rule. Especially, when dealing with
  elements, which are already mapped by default (such as heading elements), you
  may (or may not) call the parent rule:

    ```javascript
    params.parentRule(params);
    ```

  If not calling this rule, it will just override any possibly existing default
  configuration.

* **editor:** The CKEditor instance. This may be used, for example, to access
  the configuration of this CKEditor instance.

The `toView` handling is slightly more challenging to implement. This is,
because it is typical, that there are multiple element mappings for `<span>`
originating from CoreMedia RichText. Thus, a typical `toView` mapping starts
with a check, if the rule should feel responsible for mapping elements.

Let's have a look at the `toView` mapping:

```javascript
toView: {
  span: (params) => {
    const { node } = params;
    if (!node.classList.contains("mark")) {
      // It's another span, we are not responsible.
      return;
    }
    node.classList.remove("mark");
    node.name = "mark";
  }
}
```

As you see, it is checked, if the "marker" class is actually set, and if the
rule should feel responsible.

Again, you may call `params.parentRule(params);`. But, in contrast to the
`toData` mapping you cannot block all transformations of `<span>` elements
originating from CoreMedia RichText. This is because configuration parsing is
context-sensitive:

> The parent rule will only contain those `toView` mappings, which registered
> before as part of the `toData` mapping of the `<mark>` element.

All other mappings `toView` for `<span>` are handled independent of this rule.

### Data Processing Rules for Text

Similar to elements you may also add data processing rules for text nodes with a
similar configuration.

```typescript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    // ...
  ],
  "coremedia:richtext": {
    rules: {
      elements: { /* ... */ },
      text: {
        toData: (params) => {
          params.parentRule(params);
          params.node.textContent = "data";
        },
        toView: (params) => {
          params.parentRule(params);
          params.node.textContent = "view";
        },
      },
    },
  }
});
```

## Reserved Classes

Due to limitations of CoreMedia RichText 1.0 (see below) some elements from
CKEditor view need to be transformed to a more generic element. For example,
heading `<h1>` will be transformed to a normal paragraph `<p>`.

To be able to restore these elements, a typical approach is storing these
identities as `class` attribute of the transformed element. For our example
`<h1>` this means, that it is transformed to `<p class="p--heading-1">`. This
will be restored to `<h1>` when read from CMS into CKEditor again.

Having this, some _reserved_ classes exist, which must not be used in other
contexts. And, these _reserved_ classes should be respected, when transforming
these RichText contents for delivery to browsers if used within webpages.

This plugin introduced the following reserved class attribute values:

| Class          | Applicable To | Representing | Comment                                     |
|----------------|---------------|--------------|---------------------------------------------|
| `code`         | `<span>`      | `<code>`     |                                             |
| `p--heading-1` | `<p>`         | `<h1>`       |                                             |
| `p--heading-2` | `<p>`         | `<h2>`       |                                             |
| `p--heading-3` | `<p>`         | `<h3>`       |                                             |
| `p--heading-4` | `<p>`         | `<h4>`       |                                             |
| `p--heading-5` | `<p>`         | `<h5>`       |                                             |
| `p--heading-6` | `<p>`         | `<h6>`       |                                             |
| `strike`       | `<span>`      | `<s>`        |                                             |
| `td--header`   | `<td>`        | `<th>`       |                                             |
| `tr--header`   | `<tr>`        | `<tr>`       | Moved to `<thead>`. See [Table Sections][]. |
| `tr--footer`   | `<tr>`        | `<tr>`       | Moved to `<tfoot>`. See [Table Sections][]. |
| `underline`    | `<span>`      | `<u>`        |                                             |

### Ambiguous Class Mappings

Note, that data may contain ambiguous class combinations such as the following:

```html
<p class="p--heading-1 p--heading-2">H1 or H2?</p>
<p>
  <span class="strike underline">Strikethrough or underline?</span>
</p>
```

Such ambiguous states are typically resolved by deciding for one of the given
mappings (rules may implement alternative approaches, though). For headings,
a priority mapping exists, which prefers the _highest_ heading level.

For more independent rules like for code, strikethrough and underline the
behavior cannot be predicted. But: The ambiguous state will be resolved in one
way or the other when later retrieving the data.

Thus, when retrieving the data after being processed within CKEditor you may
get as result one of these:

```html
<p class="p--heading-1">H1 or H2?</p>
<p>
  <span class="strike">Strikethrough or underline?</span>
</p>
```

or

```html
<p class="p--heading-1">H1 or H2?</p>
<p>
  <span class="underline">Strikethrough or underline?</span>
</p>
```

> **Warn on ambiguous states:**
>
> It is good practice reporting such ambiguous states in console log.

This behavior is similar to, for example, CKEditor's text-alignment feature
when configured for alignment being represented as classes. An ambiguous state
like:

```html
<p class="align--center align--right">Lorem</p>
```

is resolved to one of these:

```html
<p class="align--center">Lorem</p>
```

or

```html
<p class="align--right">Lorem</p>
```

on subsequent `editor.getData()` call.

### Table Sections

[Table Sections]: <#table-sections>

CoreMedia RichText 1.0 does not know about table sections. Instead, these
table sections are represented by _reserved_ classes as well. Thus, a given
class attribute value has no direct impact on the element itself, but it
will be wrapped into another element. The following CoreMedia RichText 1.0
table:

```html
<table>
  <tbody>
    <tr class="tr--header"><td class="td--header">Head</td></tr>
    <tr><td>Body</td></tr>
    <tr class="tr--footer"><td>Foot</td></tr>
  </tbody>
</table>
```

will be transformed to:

```html
<table>
  <thead>
    <tr class="tr--header"><td class="td--header">Head</td></tr>
  </thead>
  <tbody>
    <tr><td>Body</td></tr>
  </tbody>
  <tfoot>
    <tr class="tr--footer"><td>Foot</td></tr>
  </tfoot>
</table>
```

Note: As of CKEditor 5, 24.0.0, `<tfoot>` is not supported and will be moved
to `<tbody>` instead.

## Limitations

As CoreMedia RichText 1.0 only provides a subset of HTML elements and attributes
available in HTML 5.0 for example, you have to find a representation of these
HTML elements within CoreMedia RichText 1.0.

If using the
[Font plugin](https://ckeditor.com/docs/ckeditor5/latest/features/font.html)
for example, it will add chosen colors as `style` attribute to a given element.
As the `style` attribute is unsupported by CoreMedia RichText 1.0, you may
decide to represent it as class when transforming it:

* **CKEditor HTML:**

    ```xml
    <span style="color:#00FF00">Green</span>
    ```
  
* **RichText as `class` attribute:**

    ```xml
    <span class="color--00FF00">Green</span>
    ```

Note, that for any transformation, you have to adapt the CoreMedia delivery as
well, so that when delivering CoreMedia RichText 1.0 within your webpage, the
color attribute is either re-transformed to a style attribute, or, possibly
better for a consistent site appearance, added as CSS style class.

Another example, if using the
[Table Caption plugin](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tablecaption-TableCaption.html), you
will note, that, as the name suggests, it creates an extra element `<caption>`.
As this is not supported by CoreMedia RichText 1.0 you have to think of
alternatives.

*Store in `summary` attribute?* You may think about storing the value of
`<caption>` in encoded form into the `summary` attribute (deprecated HTML
attribute, but best-fit alternative in CoreMedia RichText). Note, though, that
this comes with limitations. As the `<caption>` requires to be stored as plain
text then in `summary`, you have to encode it. Encoding it, you will especially
lose the ability to track possible internal links encoded into the summary
attribute.

Thus, such a mapping has to be carefully designed and its side effects have to
be evaluated and rated if they apply to you or not.

## See Also

* [GFMDataProcessor - CKEditor 5 API docs][gfmdataprocessor]
* [CoreMedia Richtext 1.0 DTD](coremedia-richtext-1.0.dtd)
* [CoreMedia Richtext 1.0 RNG](coremedia-richtext-1.0.rng)

[highlight]: <https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html> "Highlight - CKEditor 5 Documentation"
[mark]: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark> "<mark>: The Mark Text element - HTML: HyperText Markup Language | MDN"
[badge:docs:api]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>
[api:ckeditor-plugins]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_coremedia_richtext.html> "Module ckeditor5-coremedia-richtext"
[gfmdataprocessor]: <https://ckeditor.com/docs/ckeditor5/latest/api/module_markdown-gfm_gfmdataprocessor-GFMDataProcessor.html> "Class GFMDataProcessor (markdown-gfm/gfmdataprocessor~GFMDataProcessor) - CKEditor 5 API docs"
