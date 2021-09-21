Testing
================================================================================

This plugin does not come with automatic tests (yet). As it deeply integrates
with [CKEditor's Link Plugin][ckeditor/ckeditor5-link] and partially copies
behavior from `LinkCommand` for example, it is important to test this plugin on
each CKEditor version update.

Link Target
--------------------------------------------------------------------------------

The `LinkTarget` plugin provides the ability to set a `target` attribute for
`<a>` anchor elements. In CoreMedia RichText this is represented as `xlink:show`
and `xlink:role` attributes.

In CKEditor model `target` is represented as `linkTarget` attribute, which you
may observe in CKEditor Inspector if enabled.

**Open Inspector:** The following tests are best done having CKEditor's
inspector open.

**General Contracts:**

* **LT#G1: `linkHref` takes the lead:** If `linkHref` is unset, no `linkTarget`
  must be set. Or: `linkTarget` must never be the only attribute applied to a
  text.

* **LT#G2: `linkTarget` is never empty:** Unlike `linkHref` there is no empty
  state for
  `linkTarget`. If it is emptied, it will be removed instead from model.

* **LT#G3: One-Step Undo &amp; Redo:** Each editing action on link must always
  be able to be undone or redone with one single undo/redo step.

* **LT#G4: No Undo on Unchanged:** If the dialog has been submitted without any
  changes being applied, no undo entry should be generated.

**Terms:**

* **Collapsed Selection:** A selection always exists. It is either expanded or
  collapsed. If it is collapsed, it means that start and end position of the
  selection are the same — which again means, that only the cursor is placed
  somewhere and _nothing got selected_ from a user's perspective.

* **Expanded Selection:** This is what user's would expect a selection to be,
  i.e., you marked some text with different start and end position of the
  selection.

### LT#001: View Existing Links

Testing binding of `LinkTargetCommand` to model and mapping into the UI.

1. Load the Link Target Example into the example application.

2. Place your cursor at any of the links.

3. See, if the expected state is represented in the UI.

4. See Inspector if the expected targets match.

5. _Optional:_ Open XML Preview if the expected `xlink:show`, `xlink:role` got
   generated.

   This mapping is part of the CoreMedia RichText plugin and not part of the
   CoreMedia Link Plugin — and is covered by unit tests. Nevertheless, you may
   want to have a manual view at this mapping once.

6. While doing so, you may want to continue with LT#002.

### LT#002: Edit Existing Links

1. Same setup as for LT#001.

2. Click on any of the non-active link behaviors (despite _Open in Frame_).

3. See, that the active link behavior toggles.

4. See that especially the model is updated in Inspector.

5. Press Undo.

6. The previous link behavior should be active again.

7. Click on _Open in Frame_.

8. Now test for several custom texts:

   | Text      | Expected UI State     | Expected `linkTarget` |
       | --------- | --------------------- | --------------------- |
   | somewhere | _Open in Frame_       | somewhere             |
   | _blank    | _Open in New Tab_     | _blank                |
   | _empty_   | _Open in Current Tab_ | _unset_               |

10. Reopen for a previous _Open in Frame_ target.

11. Change the target text.

12. Cancel.

13. Press _Open in Frame_ again.

14. Model value should be in text-field, not the cancelled text before.

### LT#003: Unlink

Unlinking should always also remove the `linkTarget` attribute.

Undo of Unlink should restore both, `linkHref` and `linkTarget`.

[ckeditor/ckeditor5-link]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
