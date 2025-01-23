# CKEditor 5 Plugin: CoreMedia Richtext 1.0 DataProcessor

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_coremedia_richtext.html> "@coremedia/ckeditor5-coremedia-richtext"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-coremedia-richtext`

This plugin is required to edit
[CoreMedia Richtext 1.0](coremedia-richtext-1.0.dtd),
an XML format, which provides a subset of XHTML features.

It grants conversion of CoreMedia RichText 1.0 to the CKEditor data model as
well as conversion from CKEditor data model to CoreMedia RichText.

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
Regarding rules configuration, you also have the option to adapt these via
a provided API in `RichTextDataProcessor`.

### Strictness

```javascript
import {Strictness} from "@coremedia/ckeditor5-coremedia-richtext/RichTextSchema";
```

The strictness configures the behavior of the `toData` processing. It defaults
to `LOOSE`. Changing the strictness may be required for dealing with legacy
contents stored in CoreMedia CMS.

The following modes exist:

* **`STRICT` enforces completely valid CoreMedia Rich Text 1.0.**

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

* **`NONE` disables checks.**

  If your data-processing configuration is _bullet-proof_, you may consider
  disabling strictness completely. It will spare a process of so-called
  _sanitation_, that is triggered directly after mapping to CoreMedia
  Rich Text 1.0 and right before the data being sent to server.

  Disabling strictness and thus sanitation and having issues in your
  data-processing may prevent editors from storing data on a validating
  CoreMedia CMS.

  As _bullet-proof_ also means, to have careful testing on CKEditor 5 updates,
  which may introduce new elements/attributes not handled by data-processing,
  yet, this mode is not recommended. It may although help debugging your system
  or doing performance tests of `toData` processing.

#### Example Configurations

```typescript
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

**Note in advance:** The following section is rather complex, as you have high
capabilities to adapt and extend data-processing rules at different stages. In
general, it is recommended using carefully designed factory methods providing
such a configuration like `replaceElementByElementAndClass` instead. It may also
come handy to know, that for roughly 80% of all processing it is enough to know
of the `imported` stage and to ignore priorities (thus, use default priority
`normal`). Everything else is dedicated to more detailed processing.

As soon as you add a plugin, which supports an additional markup, you most
likely need to adapt data processing, i.e., transformation between CKEditor's
HTML and CoreMedia Rich Text 1.0.

The [Highlight Plugin][highlight] for example adds a [`<mark>`][mark] element to
HTML, which is not supported by CoreMedia RichText 1.0. You now have to model
two mappings:

1. **toData:** from HTML to CoreMedia Rich Text 1.0, and
2. **toView:** from CoreMedia Rich Text 1.0 to HTML.

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
import { replaceElementByElementAndClass }
  from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceElementByElementAndClass";

/* ... */

ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    GeneralRichTextSupport,
    // ...
  ],
  "coremedia:richtext": {
    rules: [
      replaceElementByElementAndClass({
        viewLocalName: "mark",
        dataLocalName: "span",
        dataReservedClass: "mark",
      }),
    ],
  },
});
```

As you see, you define the new rules in a section called `rules`.

`replaceElementByElementAndClass` provides a typical mapping, where an element
gets replaced by a `<span>` with an identifying class attribute value.

This convenience function may be expanded, which will provide more details
on the data processing:

```typescript
import { removeClass, renameElement } from
  "@coremedia/ckeditor5-dom-support/Elements";

ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    GeneralHtmlSupport,
    GeneralRichTextSupport,
    // ...
  ],
  "coremedia:richtext": {
    rules: [{
      toData: {
        imported: (node) => {
          if (node instanceof Element && node.localName === "mark") {
            const result = renameElement(node, "span");
            result.classList.add("mark");
            return result;
          };
          return node;
        }
      },
      toView: {
        imported: (node, { api }) => {
          if (node instanceof Element && node.localName === "span" && node.classList.contains("mark")) {
            const result = renameElement(node, "mark");
            removeClass(node, "mark");
            return result;
          };
          return node;
        },
      }
    }],
  },
});
```

Most of the time, you need to configure both directions (`toData` and `toView`).
Exceptions exist, and can be modelled, but are not part of this description.

As you see, also here we use convenience API `renameElement` and `removeClass`
here, to reduce the overhead in rule implementation. `renameElement`, for
example, provides an element of the new name, but with all attributes copied
from original element.

#### Strict Attributes

Some attributes on HTML elements are `fixed`, according to the `RichTextDtd`.
You might find those attributes obsolete and want to strip them from the created markup.
Please use the `stripFixedAttributes` rule in your editor's configuration to remove them:

```typescript
import { stripFixedAttributes } from "@coremedia/ckeditor5-coremedia-richtext";

ClassicEditor.create(document.querySelector('.editor'), {
  // ...
  "coremedia:richtext": {
    rules: [
      // ...
      stripFixedAttributes()],
  },
});
```

#### API Usage

Along with configuration as part of the CKEditor 5 instance creation, you may
provide additional rules via plugins. As the data-processor itself is assigned
in plugin initialization, rule updates are typically done in `Plugin.afterInit`,
like:

```typescript
export class RichTextDataProcessorIntegration extends Plugin {
  static readonly pluginName: string = "RichTextDataProcessorIntegration";

  afterInit(): void {
    const { editor } = this;
    const { processor } = editor.data;

    if (isRichTextDataProcessor(processor)) {
      processor.addRules([ /* ... */ ]);
    }
  }
}
```

This may be done for custom plugins, as well as bundling plugins like the
_Highlight_ plugin in an aggregating plugin, that also adds the corresponding
data processing configuration.

#### Priority

In general, it is recommended having independent rules, that do not collide.
There may be occasions though, where it is important to run a rule with high
or low priority, where _low_ means to run late in processing.

The rule configuration inherits the semantics of `PriorityString` as defined
in `ckeditor5-utils`. Possible priorities are:

1. `highest`
2. `high`
3. `normal` – the default priority used by `ckeditor5-coremedia-richtext`
4. `low`
5. `lowest`

This priority works along with the implicit priority of different processing
stages. Given a node to process, it will pass these processing stages:

1. `prepare` – the node is still part of original DOM

   You typically use this stage, if you want to benefit from richer DOM API.
   This especially applies to `toData` mapping, where, in this stage, you will
   still be able using the HTML DOM API such as `HTMLElement.dataset`. On
   `toView` processing, this richer API is available starting with stage
   `imported`.

   **Restrictions:** You must not change the identity of the node, as it is
   used directly for subsequent processing. But you may adjust attributes or
   modify children (add or remove). Regarding children, operations are limited
   strictly to the sub-hierarchy of the node. Thus, you must not move children,
   for example, to the parent node, as further processing may/will ignore this
   moved node.

2. `imported` – the node got imported similar to `Document.importNode()` of
   DOM API.

   Different to the DOM API, a node, which originally was part of the default
   namespace of the originating document, will now be of the target document's
   namespace. Thus, if you start with XHTML coming from CKEditor 5 data view
   and having a `<p>` element of this namespace, it is now still a `<p>` element
   but having the CoreMedia Rich Text 1.0 namespace assigned.

   An imported node typically has no children by default (unless preceding rules
   added some) and is not attached to a parent yet.

   Note, that this is an intermediate state. It is not necessarily to be expected
   that such nodes are valid within given namespace. See below for an example.

   This is the typical stage, where you change the identity or attributes of
   a given element.

   **Restrictions:** Regarding accessible nodes, almost no restrictions apply.
   You may change the identity of the node, you may change attributes and add
   child nodes. Note though, that added child nodes are not processed afterwards
   and thus, should be in a proper state (e.g., part of target namespace). Also,
   any subsequently processed children will be appended to the list of children
   you possibly added.

   **Tip:** If you want to remove a node and keep its children, you may return
   an empty `DocumentFragment` here. It will be filled with children of the
   original node in subsequent processing and later added as bundle to the
   parent node, which makes them merge into the parent node children.

3. `importedWithChildren` – a node and its children got imported.

   Still, the node is not appended to a parent yet. But all children got fully
   imported and appended. This stage is, for example, used to restructure tables
   in `toView` processing, i.e., move matching rows to `<thead>`, for example.

4. `appended` – a node got attached to its parent.

   This is the first time, you may access the parent of a node. Note, though,
   that you cannot expect anything regarding sibling nodes, i.e., if they already
   got processed or not.

   This processing stage exists for completeness of possible integration points
   for data-processing. In general, it is recommended to perform access across
   hierarchy within `importedWithChildren`. Thus, to process a node as part of
   its parent, you may add an `importedWithChildren` handler for the expected
   parent node instead.

##### Example Processing Stages

Let us assume, we process the `<mark>` element. First, we start with a more
detailed processing example for `toData` mapping.

1. `prepare`: We start with the original `<mark>` element being part of the
   original DOM. Modifications at this stage do not collide with any internal
   CKEditor 5 state, thus, we have a copy here of the internal CKEditor 5 state.

   The class of the `<mark>` element is `HTMLElement`, providing access to the
   richer HTML DOM API, like `HTMLElement.dataset`.

   Regarding rule priorities, all rules are called in given order, starting
   with `highest` down to `lowest` in `prepare` stage.

   **Thus, priorities are always applied per stage, not per processed node.**

2. `imported`: Rules now receive the `<mark>` element, but it is now a plain
   DOM API `Element` and has CoreMedia Rich Text 1.0 as its namespace URI.
   If a rule at `normal` priority changes this to `<span class="mark">` all
   `imported` stages at lower priority will receive the node
   `<span class="mark">` instead (the source node can still be referenced from
   a provided context information, though).

   Again, all `imported` stages are processed with priorities from `highest`
   down to `lowest`.

3. `importedWithChildren`: Rules again receive the possibly meanwhile mapped
   `<mark>` element. In examples above, they will receive `<span class="mark">`
   element. The children, like, for example, the text node wrapped by this
   element can be accessed. A rule like: _make all text uppercase if part of
   `<span class="mark">` may be applied here.

   Again, all `importedWithChildren` stages are processed with priorities from
   `highest` down to `lowest`.

4. `appended`: Rules in this stage receive the possibly transformed `<mark>`
   element as soon as it gets to its parent node, like a paragraph element.
   No guarantees made on sibling nodes here.

It is perfectly fine, to have a rule, that defined more than just one stage.
Thus, you may prepare your node for import in the `prepare` stage and apply
more transformation during the `import` stage. You should be aware though,
that both processing stages not necessarily follow each other. The identity
of the node may have changed between `prepare` and `import`, especially
triggered by rules with higher priorities in `import` processing.

Having a short glimpse on `toView` processing regarding the example above,
the processing is the same, but again with subtle differences regarding the
available DOM API: On `toView`, the `prepare` step will start with
`<span class="mark">` being a plain element. In `imported` we will have the
richer HTML DOM API available, so that you can use `HTMLElement` API.

#### Security Considerations

For secure processing in data-processing it is recommended using richer API,
where available. For example, to add new entries to `dataset` you could do
so by invoking `element.setAttribute("data-custom-value", "example") `. But as
soon as you use variable strings and string concatenation, you may open doors
to cross-site-scripting attacks (XSS).

Thus, it is recommended using [HTMLElement.dataset][mdn-dataset] API instead:

```typescript
const setDataAt = (el: HTMLElement, key: string, value: string): void => {
  el.dataset[key] = value;
};

setDataAt(myElement, "customValue", "example");
```

This automatically applies proper dash-style conversion of camel-cased key,
takes care to put the `data-` in front of the attribute name with no need to
concatenate strings.

#### Compatibility

You may adjust the compatibility for parsing `rules` section. It defaults
to `latest` but may be set to `v10`, for example, to support object like
configuration similar to `HtmlFilter` in CKEditor 4 (note, that `v10` processing
has high complexity when it comes to dealing with slightly more complex
mapping requirements):

```javascript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    // ...
  ],
  "coremedia:richtext": {
    // Trigger old configuration parsing
    compatibility: "v10",
    rules: {
      elements: {
        mark: replaceByElementAndClassBackAndForth("mark", "span", "mark"),
      },
    },
  },
});
```

In the latest configuration, this example would look like this:

```javascript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    // ...
  ],
  "coremedia:richtext": {
    // "latest" is the default, so you may skip it.
    compatibility: "latest",
    rules: [
      replaceElementByElementAndClass({
        viewLocalName: "mark",
        dataLocalName: "span",
        dataReservedClass: "mark",
      }),
    ],
  },
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
| `p--div`       | `<p>`         | `<div>`      | Limited fallback scenario. See below.       |
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

The example of mapping a nested `<div>` in data view to `<p class="p--div">` is
an example of limitations in corresponding processing. While in HTML it is
perfectly valid having a structure like `<div><p>Text</p></div>`, this will fail
when being mapped to `<p class="p--div"><p>Text</p></p>` as this is invalid
CoreMedia Rich Text 1.0. If such a structure is handed over to sanitation (see
strictness levels above), it will be cleaned to valid CoreMedia Rich Text 1.0 by
removing the extra paragraph. Thus, the resulting representation in CoreMedia
Rich Text 1.0 will be: `<p class="p--div">Text</p>`.

Short: Try to prevent having `<div>` elements in data view.

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

Note: As of CKEditor 5, 35.0.0, `<tfoot>` is not supported and will be moved
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

## Integrations

### CKEditor 5: Link Feature

This CoreMedia Rich Text Plugin integrates with the CKEditor 5 Link Feature,
if available. As part of the integration, it registers the fixed attribute
`xlink:type` (always of value `simple`) as known attribute for links. Thus,
the attribute is also removed, when removing a link.

Note that any link attributes not handled explicitly by a given plugin,
should be registered also for clean-up and other editing interactions.

Data-processing provides the following attributes in data view:

| Rich Text       | Data View            | Comment                                                   |
|-----------------|----------------------|-----------------------------------------------------------|
| `xlink:actuate` | `data-xlink-actuate` | Unhandled. See below for recommended actions to take.     |
| `xlink:href`    | `href`               | Attribute automatically handled by Link Plugin.           |
| `xlink:role`    | `target`<sup>*</sup> | Combined with `xlink:show`. Requires `LinkTarget` plugin. |
| `xlink:show`    | `target`<sup>*</sup> | Combined with `xlink:role`. Requires `LinkTarget` plugin. |
| `xlink:title`   | `title`              | Unhandled. See below for recommended actions to take.     |
| `xlink:type`    | `data-xlink-type`    | Fixed attribute already registered: Nothing to do         |

Unless you have enabled plugins to handle the attributes, you should define them
manually as belonging to a link. As, for example, there is not yet a plugin
available to handle `title` and `data-xlink-actuate`, you should extend your
configuration like this:

```typescript
import Link from "@ckeditor/ckeditor5-link/src/link";
import { LinkAttributes } from "@coremedia/ckeditor5-link-common/LinkAttributes";

const linkAttributesConfig: LinkAttributesConfig = {
  attributes: [
    { view: "title", model: "linkTitle" },
    { view: "data-xlink-actuate", model: "linkActuate" },
  ],
};

ClassicEditor.create(sourceElement, {
  plugins: [
    Link,
    LinkAttributes,
    /* ... */
  ],
  link: {
    defaultProtocol: "https://",
    ...linkAttributesConfig,
    /* ... */
  }
});
```

If not doing so, you may experience, e.g., when removing a link, that
orphaned attributes remain.

Other possible symptoms are, that when moving the cursor to the end or to the
beginning of a link and start typing, you may experience a link without `href`
attribute but with these orphaned attributes being created.

## See Also

* [GFMDataProcessor - CKEditor 5 API docs][gfmdataprocessor]
* [CoreMedia Richtext 1.0 DTD](coremedia-richtext-1.0.dtd)
* [CoreMedia Richtext 1.0 RNG](coremedia-richtext-1.0.rng)

[highlight]: <https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html> "Highlight - CKEditor 5 Documentation"
[mark]: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark> "<mark>: The Mark Text element - HTML: HyperText Markup Language | MDN"
[gfmdataprocessor]: <https://ckeditor.com/docs/ckeditor5/latest/api/module_markdown-gfm_gfmdataprocessor-GFMDataProcessor.html> "Class GFMDataProcessor (markdown-gfm/gfmdataprocessor~GFMDataProcessor) - CKEditor 5 API docs"
[mdn-dataset]: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset> "HTMLElement.dataset - Web APIs | MDN"
