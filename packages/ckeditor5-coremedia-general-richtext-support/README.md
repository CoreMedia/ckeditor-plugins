# CoreMedia General RichText Support

The General RichText Support (“GRS”) ensures that any valid CoreMedia RichText,
especially attributes, may be loaded into CKEditor 5. It does not provide any
editing features, but only registers elements, attributes and attribute-values,
which are not yet supported by corresponding editing and/or data-processing
features.

GRS is based on CKEditor 5's [General HTML Support (“GHS”)][GHS]. GRS shares the
same state as GHS, which is, as of now, an experimental state.

**Not part of CoreMedia Essentials:** This plugin is not part of the
_CoreMedia Essentials_, as it depends on your use-case, if you prefer running
CKEditor 5 in CoreMedia CMS with or without it.

## Do I need to install GRS?

If all your RichText data are created via CKEditor 5 within CoreMedia CMS:
most likely not. You should consider installing GRS, if you answer one of the
following question with _"yes"_:

* **Do you use CoreMedia CMS from before introducing CKEditor 5?**

    This of course especially applies to the data created from previous
    CMS versions, as those, still using CKEditor 4.

* **Do you create RichText with different CMS clients than CKEditor 5?**

    This applies to anything, from CoreMedia Unified API, XLIFF import,
    import from external sources (Content Hub), …

If not installing GRS, any RichText, which is loaded and edited within
CKEditor 5 will get all elements and attributes removed, which cannot be created
by the installed CKEditor 5 editing features. This may be a desired behavior,
though.

## Pitfall: Customizing Default Data-Processing

**Short:** When you adapt data-processing for new elements and/or attributes
to be represented in CoreMedia RichText 1.0, you most likely also have to
extend the configuration of General HTML Support, thus, introduce a
`htmlSupport` configuration section.

**Architecture:** Prior to describing an important pitfall, which is relevant
as soon, as you customize data-processing like mapping an element unknown to
CoreMedia RichText 1.0 to a known element with some designated class attribute
value (such as `<mark>` to `<span class="mark">`), let's rephrase the
general architecture overview depicted in CKEditor 5 documentation on the
[Editing engine][]:

There is a subtle difference between the data retrieved via `editor.getData()`
and the data transformed to CKEditor model and later to CKEditor view: While
`editor.getData()` will provide CoreMedia RichText 1.0, the internal data
layer in CKEditor (as used for CoreMedia RichText 1.0 Editing) is represented
as HTML (which again is different from the HTML in view).

![Overview CKEditor Editing Engine & GHS/GRS](docs/overview-ckeditor-editing-engine.normal.svg)!

**Example:**

* **Data:** By contract, a heading level 1 is represented in CoreMedia RichText
    1.0 as `<p class="p--heading-1">`.

* **Data View:** The _data view_ when it comes to CoreMedia RichText 1.0 support
    is HTML. Thus, data-processing will transform `<p class="p--heading-1">` to
    `<h1>`.

* **Model:** CKEditor processing will now transform `<h1>` to `<heading1>`.

* **Editing View:** This is where editors write, copy and paste to, etc. It is
    the browser's representation and thus, again HTML. But different to the
    Data View, it may come with additional elements and attributes, like for
    example class attributes to mark a selection as result of an editing
    action.

**General RichText/HTML Support is about the Data View:** What is important to
know, is that any configuration for GRS (and thus GHS) applies to the Data View.

Thus, when a RichText paragraph may have an additional attribute like `dir` it
is insufficient just configuring the allowed attribute for element `<p>` in
GHS: You must also register the same attribute for all elements in Data View,
which will be mapped to `<p>` in Data later on. Thus, we will have to configure
GHS similar to this:

```javascript
{
  htmlSupport: {
    allow: [{
      name: /^(p|h[1-6])$/,
      attributes: {
        dir: /(rtl|ltr)/,
      },
    }],
  },
}
```

This is, what is done by the `GeneralRichTextSupport` plugin for all elements
pre-configured in RichText Data Processing. But this does not know about any
customizations such as introducing new elements.

**What to do for custom elements and attributes?** Luckily, the GHS
configuration is extensible. Thus, a plugin may enrich the configuration, and
you may as well decide adding _late_ configuration, which is, when creating
the `ClassicEditor` instance.

Having this, introducing support for a new element such as `<mark>` from
[Highlight feature] requires two steps, if you want to ensure, that attributes
added via Unified API for example are not removed as soon as edited in CKEditor:

1. Add data-processing to represent `<mark>` in CoreMedia RichText 1.0.
2. Extend GHS configuration provided by GRS by the new element.

If we decide representing `<mark>` as `<span class="mark">` you will require
two configuration entries `coremedia:richtext` and `htmlSupport`:

```javascript
import CoreMediaRichText
  from "@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText";
import GeneralHtmlSupport
  from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import GeneralRichTextSupport
  from "@coremedia/ckeditor5-coremedia-general-richtext-support/GeneralRichTextSupport";
import {replaceByElementAndClassBackAndForth}
  from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceBy";
import {CoreMediaRichText10Dtd}
  from "@coremedia/ckeditor5-coremedia-general-richtext-support/GeneralRichTextSupport";

/* ... */

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
        mark: replaceByElementAndClassBackAndForth("mark", "span", "mark"),
      },
    },
  },
  htmlSupport: {
    allow: [
      {
        name: "mark",
        ...CoreMediaRichText10Dtd.attrs,
      }
    ],
  },
});
```

As you see, this already uses two convenience APIs provided by the CoreMedia
plugins:

* **`replaceByElementAndClassBackAndForth`:**

    This adds a rule, which maps `<mark>` to `<span class="mark">` in
    data-processing.

* **`CoreMediaRichText10Dtd.attrs`:**

    These are the attributes, which are marked as _allowed_ for `<span>`,
    for example, in CoreMedia RichText.

**Less Convenient Configuration:** A less convenient configuration exposes some
details, which may help to understand the processing better. So, if inlining
the convenience API from above, the example above will be similar to:

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
  htmlSupport: {
    allow: [
      {
        name: "mark",
        classes: true,
        attributes: {
          lang: true,
          dir: /(rtl|ltr)/,
        },
      }
    ],
  },
});
```

Having this example, you may see, how to create a lot more complex scenarios
for data-processing and GHS configuration.

[GHS]: <https://ckeditor.com/docs/ckeditor5/latest/api/html-support.html> "CKEditor 5 HTML Support feature - CKEditor 5 API docs"
[Editing engine]: <https://ckeditor.com/docs/ckeditor5/latest/framework/guides/architecture/editing-engine.html> "Editing engine - CKEditor 5 Documentation"
[Highlight feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/highlight.html> "Highlight - CKEditor 5 Documentation"
