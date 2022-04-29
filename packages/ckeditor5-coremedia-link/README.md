CoreMedia CKEditor 5 Link Plugins
================================================================================

The plugins provided in `ckeditor5-link` extend the
[CKEditor 5 Link Feature][cke5:docs:link:feature] in several ways:

* **[LinkTarget Plugin](src/linktarget/README.md):**

  Adds a configuration option for the `target` behavior to link editing. It
  extends the `LinkActionsView` by buttons to toggle between different
  behaviors.

* **[ContentLink Plugin](src/contentlink/README.md):**

  Adds support for links to contents within CoreMedia CMS. It extends
  the `LinkFormView` to be able to represent links to contents and to accept
  contents dropped from within CoreMedia Studio. It also registers a creator
  function to support ContentLinks in the **ContentClipboard** plugin.

See Also
--------------------------------------------------------------------------------
[[Top][]]


* **[Manual Testing](./TESTING.md)**

    Notes for manual testing, which should be done on each CKEditor update.

<!-- ======================================================== [ References ] -->

[Top]: <#top>

[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
[Manual Testing]: <./TESTING.md>
