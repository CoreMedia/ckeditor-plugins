# CKEditor 5 Plugin: Data Facade

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_coremedia_richtext.html> "@coremedia/ckeditor5-data-facade"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-data-facade`

This plugin provides support to prevent data with no semantic change being
propagated to the outside.

## Motivation

As described in a [corresponding CKEditor 5 issue][ckeditor/ckeditor5-11900],
just set data may not be strictly equal to the retrieved data. One possible
reason is the underlying model, that hides some details like the order of
elements.

As an example, take the following HTML snippet:

```html
<em><strong>Lorem</strong></em>
```

In the CKEditor 5 model, this is represented as:

```json
{
  "Text": "Lorem",
  "Attributes": {
    "bold": "true",
    "italic": "true"
  }
}
```

This does, of course, have two valid representations when later retrieved
getting the data:

| Option 1 (strictly equal)         | Option 2 (semantically equal)     |
|-----------------------------------|-----------------------------------|
| `<em><strong>Lorem</strong></em>` | `<strong><em>Lorem</em></strong>` |

Along with plugins like the Autosave plugin, this may result in storing changes
to some backend without any relevant change. In more complex systems, like
CoreMedia CMS, this may trigger subsequent events that should be prevented like
a so-called _auto-checkout_ of documents just by opening them.

A similar motivation is when you are using a misconfigured CKEditor 5 instance
missing support for _Bold_. In this case, the result may look like this:

```html
<!-- Data Set -->
<em><strong>Lorem</strong></em>

<!-- Data Retrieved -->
<em>Lorem</em>
```
We may not want to write these possibly corrupted data without explicit
editorial interaction.

## The Solution, Part 1

The solution relies on version tracking of CKEditor 5. When we set data, the
document version gets updated. If this version is still the same, when we
retrieve the data later, we know that nothing should have changed.

Using this plugin introduces some cache for the data that ensures that a call
like:

```typescript
const originalData = "<em><strong>D</strong></em>";
plugin.setData(originalData);
const newData = plugin.getData();
if (originalData !== newData) {
  throw new Error("Should not happen.");
}
```

will always succeed.

Internally, it caches the originally set value, and when getting the data, it
will return the original value, in case the document version did not update.

## The Solution, Part 2

CKEditor 5 instances at least in CoreMedia Studio are re-used to reduce memory
consumption. As such, the following scenario may happen:

```text
context A:
  plugin.setData("Context A");
context B:
  plugin.setData("Context B");
context A:
  plugin.getData();
```

In _Context A_, we expect, of course, that `"Context A"` is returned on get.

This can be prevented by providing some context information. The plugin will
automatically signal by a reserved return value, when contexts signal a
mismatch. This approach leaves it up to the using API, if to throw errors or
transparently ignore this state.

## Out of Scope: Handle _Editor Not Ready Yet_

As this plugin is bound to the editor instance, it cannot handle a state like
_Editor Not Ready Yet_. If you have a setup, where setting data may be tried
earlier than the editor instance being ready to receive data, you have to find
another solution.

TODO: We may want to also provide a solution here.

[ckeditor/ckeditor5-11900]: <https://github.com/ckeditor/ckeditor5/issues/11900> "Veto Autosave on "no semantic change" · Issue #11900 · ckeditor/ckeditor5"
