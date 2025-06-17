# CoreMedia CKEditor 5 Link Plugins

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_coremedia_link.html> "@coremedia/ckeditor5-coremedia-link"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-coremedia-link`

The plugins provided in `ckeditor5-link` extend the
[CKEditor 5 Link Feature][cke5:docs:link:feature] in several ways:

* **[LinkTarget Plugin](src/linktarget/README.md):**

  Adds a configuration option for the `target` behavior to link editing. It
  extends the link balloon's `ToolbarView` by buttons to toggle between different
  behaviors.

* **[ContentLink Plugin](src/contentlink/README.md):**

  Adds support for links to contents within CoreMedia CMS. It extends
  the `LinkFormView` to be able to represent links to contents and to accept
  contents dropped from within CoreMedia Studio. It also registers a creator
  function to support ContentLinks in the **ContentClipboard** plugin.

To ease integration into CKEditor's Link plugin, we also have [assistive
tooling](../ckeditor5-link-common/src/README.md).

## Installation

```text
pnpm install @coremedia/ckeditor5-coremedia-link
```

```javascript
import { ContentLinks, LinkTarget } from "@coremedia/ckeditor5-coremedia-link";

ClassicEditor.create(document.querySelector('#editor'), {
  plugins: [
    ContentLinks,
    LinkTarget,
    /* ... */
  ],
}).then((editor) => {
  /* ... */
});
```

## See Also

* **[Manual Testing][]**

    Notes for manual testing, which should be done on each CKEditor update.

<!-- ======================================================== [ References ] -->

[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
[Manual Testing]: <./TESTING.md>
