CoreMedia CKEditor 5 Link Plugin
================================================================================

This plugin extends the [CKEditor 5 Link Feature][cke5:docs:link:feature] in
several ways:

* **[LinkTarget Plugin](#linktarget-plugin):**

    Adds a configuration option for the `target` behavior to link editing.

* **LinkCoreMediaContent Plugin (planned):**

    Adds support for internal links within CoreMedia CMS.

For further information you will find more references at [the end](#see-also).

LinkTarget Plugin
--------------------------------------------------------------------------------
([Top](#_top))<a id="linktarget-plugin"></a>

The `LinkTarget` plugin adds support for a new model attribute `linkTarget` for
links. It integrates deeply with the
[CKEditor 5 Link Feature][cke5:docs:link:feature] and extends the corresponding
editing balloon by selection of a target behavior.

See Also
--------------------------------------------------------------------------------
([Top](#_top))<a id="see-also"></a>

* **[Design Considerations](./DESIGN.md)**

    Some notes why these plugins got implemented in the given way.

* **[Manual Testing](./TESTING.md)**

    Notes for manual testing, which should be done on each CKEditor update.

<!-- ======================================================== [ References ] -->

[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
