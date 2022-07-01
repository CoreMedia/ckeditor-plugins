Usage of CoreMedia RichText Plugin
================================================================================

To enable CoreMedia RichText Plugin, just add it to your list of plugins when
configuring `ClassicEditor`:

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

First Test
--------------------------------------------------------------------------------

For a first test of the `toView` mapping, just add some CoreMedia RichText to
the body of your editor node:

```xhtml

<div class="editor" style="display:none;">
  <div xmlns="http://www.coremedia.com/2003/richtext-1.0">
    <p class="p--heading-1">Lorem Ipsum Dolor</p>
    <p>
      This is an example of the CoreMedia RichText Plugin.
    </p>
  </div>
</div>
```

It will transform the CoreMedia RichText XML to CKEditor HTML:

```html
<h1>Lorem Ipsum Dolor</h1>
<p>
  This is an example of the CoreMedia RichText Plugin.
</p>
```

Storing Data
--------------------------------------------------------------------------------

The data may be retrieved anytime by `editor.getData()`. It will return the XML,
so that it conforms to CoreMedia RichText 1.0 DTD.

### Normalizers

Note, that due to CKEditor's transformations (also provided by data processing),
the value passed to `editor.setData(<string>)` and the directly received data
afterwards via `editor.getData()` may differ. For example, the XML declaration
is always returned without newline:

```
<?xml version="1.0" encoding="UTF-8"?><div/>
```

But on receiving the data, it is perfectly fine to skip the declaration or add
some newline:

```
<?xml version="1.0" encoding="UTF-8"?>
<div/>
```

In some contexts, such a behavior may cause unwanted follow-up actions and
even costs: In CoreMedia Studio such a change will trigger auto-checkout,
documents will be marked as changed afterwards, which again raises a lot of
other processes like publication and translation.

To prevent such semantic equivalent structures to trigger subsequent actions,
you may apply so-called _Normalizers_. They are provided as Mix-In to
the `RichTextDataProcessor`, as they are strongly related to the chosen
data processor (normalization for Markdown has to be different to XML
normalization).

These normalizers are meant to provide some easy to compare data, where
irrelevant changes have been normalized and thus, values, which are not equal,
may be considered equal after applying normalizers.

By default, one of those normalizers available in `RichTextDataProcessor`
removes any XML declaration.

These normalizers are typically invoked when auto-save got triggered, to see,
if the change should be forwarded to the server.

A typical approach looks like this:

* Remember the data and their normalization when forwarding them to CKEditor
  (`setData`).

* When retrieving the data on auto-save, normalized the data retrieved via
  `getData`.

* Compare those normalizations (before/after) if they are equal or not.

* If they are unequal, just forward the new data as received from CKEditor.

* If normalizations are equal, you may return the remembered last data instead,
  so that subsequent processing is able to detect "unchanged".

To check, if the current data-processor provides normalization, it is
recommended using the type-guard `isDataDiffer` as provided by `DataDiffer`:

```typescript
const { processor } = editor.data;
if (isDataDiffer(processor)) {
  const normalized = processor.normalize(data);
  // ...
}
```

#### Adapting Normalization

If you experience unwanted auto-checkout behavior, you may consider adding
additional normalizers. Normalizers are applied at different priority levels.
Most normalizers run at priority 0. Higher numbers decrease the priority.
The last default normalizers, which transforms strings to hash-codes, runs
with priority `Number.MAX_SAFE_INTEGER`, because afterwards no additional
normalization is expected.

You could adapt normalization in your initialization phase of CKEditor:

```typescript
ClassicEditor.create(document.querySelector('.editor'), {})
  .then((editor) => {
    const { processor } = editor.data;
    if (isDataDiffer(processor)) {
      processor.addNormalizer((value) => value.replaceAll("x", "u"), -10) // before default priority
      processor.addNormalizer((value) => value.toLowerCase()) // default priority 0
      processor.addNormalizer((value) => value.toUpperCase()) // run directly after previous
      processor.addNormalizer((value) => value.trim(), 10) // after default priority
    }
  });
```

#### Debugging Normalization Process

If you find unexpected auto-checkout or other behavior, you may first want to
debug the normalization process. To do so, you may for example activate the
`DataDiffer` logger via URL hash parameter:

```text
https://localhost:3000/#ckdebug=debug
```

When `DataDiffer` is now invoked, you will see normalization stages such as:

```text
[DEBUG] DataDiffer: Going to normalize data. {
  data: '<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0"><p>Lorem</p></div>'
}
[DEBUG] DataDiffer: Applied normalizers with priority 0. {data: '<div><p>Lorem</p></div>'}
[DEBUG] DataDiffer: Applied normalizers with priority 9007199254740991. {data: '312350295'}
[DEBUG] DataDiffer: Finished normalizing data. {data: '312350295'}
```

where the last normalization is a hash-code generated from the transformation
result.

Configuration
--------------------------------------------------------------------------------

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

  This is the safest mode to use, when dealing with legacy contents, as for
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
* to: `<span class="mark--marker-green">highlighted</span>`

2. **toView:**

* from: `<span class="mark--marker-green">highlighted</span>`
* to: `<mark class="marker-green">highlighted</mark>`

As configuration:

```javascript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    CoreMediaRichText,
    // ...
  ],
  "coremedia:richtext": {
    rules: {
      elements: {
        mark: {
          toData: (params) => {
            const originalClass = params.node.attributes["class"];
            params.node.attributes["class"] = `mark--${originalClass}`;
            params.node.name = "span";
          },
          toView: {
            span: (params) => {
              const originalClass = params.node.attributes["class"] || "";
              const pattern = /^mark--(\S*)$/;
              const match = pattern.exec(originalClass);
              if (match) {
                params.node.name = "mark";
                params.node.attributes["class"] = match[1];
              }
            },
          },
        },
      },
    }
  },
});
```

As you see, you define the new rules in a section called `rules` and as we will
map elements here, you use the keyword `elements` to define the mapping rules.

The definition is (mostly) from HTML view: _Given an HTML element `<mark>`, how
do I map it to a corresponding representation in CoreMedia RichText 1.0?_
That's why the mapping keys are added with the name of the element.

Most of the time, you need to configure both directions. Exceptions exist, and
can be modelled, but are not part of this description. These directions are
modelled by keywords `toData` and `toView`.

Let's have a look at the `toData` mapping first:

```javascript
mark: {
  toData: (params) => {
    const originalClass = params.node.attributes["class"];
    params.node.attributes["class"] = `mark--${originalClass}`;
    params.node.name = "span";
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
    const originalClass = params.node.attributes["class"] || "";
    const pattern = /^mark--(\S*)$/;
    const match = pattern.exec(originalClass);
    if (match) {
      params.node.name = "mark";
      params.node.attributes["class"] = match[1];
    }
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

[highlight]: <https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html> "Highlight - CKEditor 5 Documentation"

[mark]: <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark> "<mark>: The Mark Text element - HTML: HyperText Markup Language | MDN"
