# Enable CKEditor 5-Font Plugin (Color Chooser)

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

**Disclaimer:** This example has last been tested with CKEditor 37.0.1. It is
not actively maintained. It is meant as showcase and may not cover all required
implementation aspects for use in CoreMedia Studio. Also, the examples are based
on the example application within this workspace. Adaptation to CoreMedia Studio
required.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

## What you will learn

* How to add a plugin from dependency management to CKEditor 5 configuration.
* How to configure the given feature of the plugin (color chooser).
* How to adapt data-processing from/to CoreMedia Rich Text 1.0.

## Add CKEditor 5 Font Feature

In the `app/` folder, type:

```shell
pnpm add "@ckeditor/ckeditor5-font@37.0.1"
```

Ensure, to align the CKEditor 5-plugin version with your other CKEditor 5
dependencies. Mixing versions is prohibited by CKEditor 5.

**Note:** Prior to CKEditor 37.0.0 it is strongly recommended adding typings
as provided by DefinitelyTyped for proper usage within TypeScript.

Now, for this example, add the `FontColor` plugin to the CKEditor 5
configuration (`ckeditor.ts` within example application):

```typescript
import { FontColor } from "@ckeditor/ckeditor5-font";

ClassicEditor.create(sourceElement, {
  /* ... */
  plugins: [
    /* ... */
    FindAndReplace,
    FontColor,
    Heading,
    /* ... */
  ],
  /* ... */
}) /* ... */
```

Add `fontColor` as toolbar entry:

```typescript
ClassicEditor.create(sourceElement, {
  /* ... */
  toolbar: [
    /* ... */
    "heading",
    "|",
    "fontColor",
    "bold",
    /* ... */
  ],
  /* ... */
}) /* ... */
```

### The First Milestone Reached

You will now see that the color chooser is available within the toolbar, and you
may change the (text) color of your selected texts.

**But:** If switching to source editing or reviewing the data-processed XML
(i.e., CoreMedia Rich Text 1.0), you will see that nothing is left from color
styling, despite some element like `<span>` without any attribute set.

In the console you may find a warning like this, providing a hint, what may have
gone wrong:

```text
[WARN] CoreMediaRichText: Sanitation done with issues (turn on debug logging
for details): Visited Elements: 6; Removed: 0 severe of 0 total; Removed Invalid
Attributes: 1, Maximum Element Depth: 2; Duration (ms): 0.40000003576278687
```

And if you enable debug logging via hash-parameter `#ckdebug=verbose` you will
see right before this message, a message like this:

```text
[DEBUG] CoreMediaRichText: Removing invalid attribute style at span
(value: "color:hsl(30, 75%, 60%);"): invalidAtElement
```

## Adapt Data-Processing

What is missing, is the so-called data-processing. Thus, you need to find a way
to represent color styling (set as `style` attribute) to some valid
representation in CoreMedia Rich Text 1.0. The most prominent example
representation, often used in these cases, is to represent such attribute
values within the `class` attribute. For styling, this is the perfect match –
and you may even decide to forward this as is to subsequent delivery such as
in CAE or Headless Server. Thus, just add corresponding CSS styling.

Within example application, we can see the results in the CKEditor 5 inspector.
It will show us that the result is stored in the editing view as:

```xml
<span style="color:hsl(30, 75%, 60%);">Colored Text</span>
```

To benefit from a predictable format, that also aligns with the representation
in the data view, we configure RGB colors instead, such as:

```typescript
ClassicEditor.create(sourceElement, {
  /* ... */
  fontColor: {
    colors: [
      {
        color: "rgb(230,153,77)",
        label: "Orange",
      },
    ],
  },
  /* ... */
}) /* ... */
```

**Note on color codes:** This is only a design sketch. On implementation, you
should ensure:

* That color-code can be written as valid class-token on `toData` processing.
* That the color-code mapped back to data view and subsequent editing view
  matches the expectations of CKEditor 5 implementation, so that selected colors
  are correctly highlighted in the color-chooser.

**Back to Data-Processing:** We decide to use a bijective representation mapping
like this:

* **HTML:** `<span style="color:rgb(230, 153, 77);">Colored Text</span>`
* **Rich Text:** `<span class="style--color-rgb-230-153-77">Colored Text</span>"`

### Helper Methods

Designing data-processing may get rather complex. To have an easy to understand
and maintain data-processing, it is highly recommended to extract helper
methods. The following helper methods and interfaces will help us to design
our mapping:

```typescript
// Result object for matching via Regular Expression.
interface Rgb {
  r: string;
  g: string;
  b: string;
}

// Actual result with named groups from matching.
interface RgbGroups {
  groups: Rgb;
}

// Matches rgb(123, 123, 123) in data view.
const colorStyleRgbRegExp = /rgb\(\s*(?<r>\d+)\s*,\s*(?<g>\d+)\s*,\s*(?<b>\d+)\s*\)/;

// Matches RGB Color Code as it is represented in data view.
const matchRgbColorCode = (colorStyleRgb: string): Rgb | undefined => {
  const match = colorStyleRgbRegExp.exec(colorStyleRgb);
  if (!match) {
    return undefined;
  }
  // @ts-expect-error - No named group support, yet:
  //   https://github.com/microsoft/TypeScript/issues/32098
  const {
    groups: { r, g, b },
  }: RgbGroups = match;
  return { r, g, b };
};

// Matches style--color-rgb-123-123-123 in data.
const colorEncodedRgbRegExp = /^style--color-rgb-(?<r>\d+)-(?<g>\d+)-(?<b>\d+)$/;

// Matches RGB Color Code as it is represented in data.
const matchEncodedRgbColorCode = (encodedRgbColor: string): Rgb | undefined => {
  const match = colorEncodedRgbRegExp.exec(encodedRgbColor);
  if (!match) {
    console.error(`Unmatched color code: ${encodedRgbColor}`);
    return undefined;
  }
  // @ts-expect-error - No named group support, yet:
  //   https://github.com/microsoft/TypeScript/issues/32098
  const {
    groups: { r, g, b },
  }: RgbGroups = match;
  return { r, g, b };
};

// General HTML DOM Helper method, to remove empty attributes that may
// otherwise still trigger a warning on data-processing.
const removeStyleColorAttribute = (el: HTMLElement): void => {
  el.style.color = "";
  // Remove as it is possibly empty.
  if (!el.getAttribute("style")?.trim()) {
    el.removeAttribute("style");
  }
};
```

### Data-Processing Rule

Also, placing the rule outside the actual configuration may help to provide a
better overview. Thus, the rule, we want to add may look like this:

```typescript
import { removeClass } from "@coremedia/ckeditor5-dom-support/Elements";

const styleRgbColorToClass: RuleConfig = {
  id: "style-rgb-color-to-class",
  toData: {
    prepare: (node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      // Benefit of richer HTML Element API due to `prepare` step.
      const { color } = node.style;
      const colorMatch = matchRgbColorCode(color);
      if (colorMatch) {
        node.classList.add(`style--color-rgb-${colorMatch.r}-${colorMatch.g}-${colorMatch.b}`);
        // Only remove on match. Other rules may otherwise want to take over.
        removeStyleColorAttribute(node);
      } else if (color) {
        // Only debug, as other rules may kick in.
        console.debug(`Unmatched and thus unmapped color: ${color}`);
      }
    },
  },
  toView: {
    imported: (node) => {
      if (!(node instanceof HTMLElement)) {
        return node;
      }

      const found = [...node.classList].find((cls) => colorEncodedRgbRegExp.test(cls));

      if (found) {
        const match = matchEncodedRgbColorCode(found);
        if (match) {
          node.style.color = `rgb(${match.r}, ${match.g}, ${match.b})`;
          // Removes the class and the class attribute itself, when it is empty.
          removeClass(node, found);
        }
      }
      return node;
    },
  },
};
```

Some notes on the design of the rule:

* In `toData` processing we use the `prepare` stage. Having this, we benefit
  from the `HTMLElement` API, providing access to `classList` and `style`.

* In `toView` we use the later (and often preferred) stage `imported`, where
  a node already got created in target document but not attached yet. Again, as
  we are closer to the data view, we already benefit from the `HTMLElement` API.

* We only remove the representation of the color code in data or data view
  respectively on match. For the `toData` processing all unmatched style
  attributes will be removed automatically by sanitation (but will also raise
  a console warning). For the `toData` as well as the `toView` mapping, there
  may also be additional rules, that take care of the yet unmatched attribute.
  Such, as you may have an extra rule for HSL color codes.

### Applying Data-Processing Rule

Now, all we need to do is adding this new rule to our data-processing. This
can either be done directly within the CKEditor 5 configuration, or, as highly
recommended, as extra plugin calling the corresponding API for adding rules.

For simplicity we will show the configuration approach here:

```typescript
ClassicEditor.create(sourceElement, {
  /* ... */
  "coremedia:richtext": {
    rules: [
      styleRgbColorToClass,
      /* ... */
    ],
    /* ... */
  },
  /* ... */
}) /* ... */
```

## Side Note For Example App

For the example app, ensure to update `tsconfig.json` to refer to
`ckeditor5-dom-support` if missing.

## Done

We hope, that you found this walk-through helpful. Feel free adding issues, if
you feel information is inappropriate, outdated or could benefit from some
enhancement.

## See Also

* [CKEditor 5 Font Feature][features-font] ([latest][features-font-latest])

[features-font]: <https://ckeditor.com/docs/ckeditor5/37.0.1/features/font.html> "Font family, size, and color"
[features-font-latest]: <https://ckeditor.com/docs/ckeditor5/latest/features/font.html> "Font family, size, and color"
