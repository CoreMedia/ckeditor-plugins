RichText Data Processor: Configuration API
================================================================================

We are just at designing a central aspect for enabling CKEditor 5 for CoreMedia
Studio: Adding a plugin for data processing CoreMedia RichText 1.0 from view
to data and vice versa.

The first sketch exists for mapping elements from view to data with a similar
design as it was for CKEditor 4. As for example CoreMedia RichText 1.0 does
not support elements `<h1>` to `<h6>`, we need to transform it to a paragraph
`<p>` with a well-known class:

```javascript
{
  h1: (element) => {
    element.name = "p";
    element.attributes["class"] = "p--heading-1";
  } 
}
```

CKEditor 4: Misbehavior of CoreMedia Data Processing
--------------------------------------------------------------------------------

In CKEditor 4 we ignored modeling the reverse-mapping. Thus, even within
CKEditor HTML a previously entered `<h1>` was restored from server as
`<p class="p--heading-1">`.

This caused no obvious problem at first glance, as actions to insert headings
were custom actions always adding `<p class="p--heading-1">` when a heading
has been selected during formatting.

The problem only became obvious on paste from external sources: CKEditor HTML
contained `<h1>` but toolbar buttons for headings did not correctly get
enabled or disabled. To make them update according to current cursor position
you had to reload the data from server, so that CKEditor HTML contains the
class-annotated `<p>` element.

CKEditor 5: Sketching Requirements
--------------------------------------------------------------------------------

### Req. 1: Use CKEditor Toolbars and Actions

The central requirement is, that CKEditor toolbars and actions, which come by
default, are supported. Thus, if the editor has an action to set the current
line to heading level 1, no customization should be required to the action: It
should just simply add `<h1>`, not more.

### Req. 2: Provide Bijective Mapping

To be able to fulfill Req. 1, we need to ensure that any mapping from
`<h1>` to `<p class="p--heading-1">` comes with a reverse mapping, so that
`<p class="p--heading-1">` becomes `<h1>` when rendered in CKEditor.

### Req. 3: Configuration Option

Each new feature added to CKEditor (like for example choosing font-colors)
requires thinking about mapping from HTML to CoreMedia RichText 1.0.

Sticking to the example of font-colors we will most likely have a `style`
attribute added, which is not valid in CoreMedia RichText 1.0. If we choose
mapping it to some class attribute like for example
`<span class="style--color-00ff00">` we should be able specifying this in
the configuration section of a CKEditor instance.

### Req. 4: Extension Point

We not only need to be able to configure behaviors, we must be able extending
them. Think of an attribute added to `<h1>` by a new CKEditor plugin. We now
must be able to extend the default `<h1>` mapping from `<h1>` to
`<p class="p--heading-1">`.

### Req. 5: Configurable Extension Point

This may be an optional requirement, at least not priority one: It may be nice,
if it would be possible to access the configuration as well from mapping rules.
This way, we can access for example the strictness setting.

### Req. 6: Easy Bijective Mapping Overview

In traditional CKEditor 4 implementation, we would have two mappings kept
separate. One for the `toData` direction (HTML to RichText) and one for the
`toView` direction (RichText to HTML).

This is easily error-prone, as when mapping one way you should not forget
about mentioning the reverse mapping as well.

The idea is to have both mappings close together, so that you can easily spot
_a missing branch_.

### Req. 7: One Way Mapping

It should be possible proving one way mapping. This most likely is especially
about adjusting elements, which cause invalid CoreMedia RichText 1.0.

### Req. 8: Similarity to CKEditor 4 Data Processing

At the time of writing, this is already fulfilled, but it may break, if we
decide to refactor the approach. To be able to see, if the mapping in CKEditor 5
is similar to CKEditor 4 mapping, the mapping configuration should be similar.

### Req. 9: Fast

Any solution we find needs to be fast on repeating calls. It is expected, that
for example every 5 seconds the data need to be stored back to the server, and
thus transformed. An editor must not experience noticeable difference while
typing in a 10-character text from a 20,000-character text (roughly guessed
number). 

Configuration Sketch
--------------------------------------------------------------------------------

### Default Mapping

By default, the mapping may look as follows:

```javascript
{
  elements: {
    h1: {
      toData: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-1";
      },
      toView: {
        p: (element) => {
          if (element.attributes["class"] === "p--heading-1") {
            element.name = "h1";
            delete element.attributes["class"];
          }
        }
      }
    },
    // Similar mapping as above. Challenge: Two rules to handle p elements.
    h2: {
      toData: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-2";
      },
      toView: {
        p: (element) => {
          if (element.attributes["class"] === "p--heading-2") {
            element.name = "h2";
            delete element.attributes["class"];
          }
        },
      },
    },
    // The One-Way Direction (Here just removing an invalid element we want to ignore).
    "invalid:element": () => false,
    // Especially for configuration access, the editor instance is handed over
    // as optional argument:
    "$$": (element, editor) => {
      // now do processing according to given strictness for example.
    },
  }
}
```

This is still similar to the CKEditor 4 configuration. It also has the toView
mapping close to the toData mapping. The idea is, that on initialization phase
we dynamically split the toData and toView mapping into two, to have a fast
lookup table during processing. In the end, we will have something like this:

toData:

```javascript
{
  elements: {
    h1: (element) => {
      element.name = "p";
      element.attributes["class"] = "p--heading-1";
    },
    h2: (element) => {
      element.name = "p";
      element.attributes["class"] = "p--heading-2";
    },
    "invalid:element": () => false,
    "$$": (element, editor) => {
      // ...
    },
  }
}
```

toView:

```javascript
{
  elements: {
    p: [
      (element) => {
        if (element.attributes["class"] === "p--heading-1") {
          element.name = "h1";
          delete element.attributes["class"];
        }
      },
      (element) => {
        if (element.attributes["class"] === "p--heading-2") {
          element.name = "h2";
          delete element.attributes["class"];
        }
      },
    ]
  }
}
```

Now, we can just check for each element name in the map. For the toView part
we need an array, as both rules may apply to `<p>`.

### Configuration and Extension

Here is an example, how we may add the font-color mapping to a span. It takes
into account, that we may already have a mapping for spans in the default
configuration. If we don't, we will override the behavior, which may be
another desired use-case.

```javascript
ClassicEditor.create(document.querySelector( '.editor' ), {
  plugins: [
    // ...
    CoreMediaRichText
  ],
  "coremedia:richtext": {
    strictness: Strictness.STRICT,
    rules: {
      // editor: Just showing, how to pass the editor if we require for example
      // configuration access.
      span: (element, super, editor) => {
        // Unsure, if super is a reserved word. If yes, just choose another name.
        super.apply(this, arguments);
        // Very simplistic approach. Just for demonstration purpose.
        if (element.attributes["style"]?.contains("color:white")) {
          element.attributes["class"]=`${element.attributes["class"]}`;
        }
      };
    },
  },
});
```

Having this, we may also change our mind on how to handle the parsed `toView`
mapping. Instead, upon parsing, we just may override the existing mapping
with a new one, taking the old mapping into account.
