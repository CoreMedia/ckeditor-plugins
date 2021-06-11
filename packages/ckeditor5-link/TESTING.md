Testing
================================================================================

This plugin does not come with automatic tests (yet). As it deeply integrates
with [CKEditor's Link Plugin][ckeditor/ckeditor5-link] and partially copies
behavior from `LinkCommand` for example, it is important to test this plugin
on each CKEditor version update.

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

* **LT#G1: `linkHref` takes the lead:** If `linkHref` is unset, no `linkTarget` must be
    set. Or: `linkTarget` must never be the only attribute applied to a text.

* **LT#G2: `linkTarget` is never empty:** Unlike `linkHref` there is no empty state for
    `linkTarget`. If it is emptied, it will be removed instead from model.

* **LT#G3: One-Step Undo &amp; Redo:** Each editing action on link must always
    be able to be undone or redone with one single undo/redo step.

* **LT#G4: No Undo on Unchanged:** If the dialog has been submitted without
    any changes being applied, no undo entry should be generated.

**Terms:**

* **Collapsed Selection:** A selection always exists. It is either expanded
    or collapsed. If it is collapsed, it means that start and end position of
    the selection are the same — which again means, that only the cursor is
    placed somewhere and _nothing got selected_ from a user's perspective.

* **Expanded Selection:** This is what user's would expect a selection to be,
    i.e., you marked some text with different start and end position of the
    selection.

### LT#001: Editing Existing Links

Testing binding of `LinkTargetCommand` to model and mapping into the UI.

1. Load the Link Target Example into the example application.

2. Place your cursor at any of the links.

3. Open the link editor (e.g., via Ctrl+K or Cmd+K).

4. See, if the expected state is represented in the editing UI.

5. See Inspector if the expected targets match.

6. _Optional:_ Open XML Preview if the expected `xlink:show`, `xlink:role` got generated.

    This mapping is part of the CoreMedia RichText plugin and not part of the
    CoreMedia Link Plugin — and is covered by unit tests. Nevertheless, you
    may want to have a manual view at this mapping once.

### LT#002: Create Link With Target

Testing special path in CKEditor's `LinkCommand` for collapsed selection, when
the cursor position is not within an already existing link: It will write the
URL as text, while also applying the `linkHref` attribute. If a `linkTarget`
got specified, this newly written text must get the corresponding value set
in model.

1. Load the Link Target Examples for reference of expected attribute values.

2. Place the cursor at any position having nothing selected.

3. Press link-button in toolbar.

4. Set some link behavior without setting a link. Confirm.

5. No link should have been generated, no undo step should have been generated.

6. Press link-button again.

7. Choose some random link and some link behavior. Confirm.

8. Link text should have been written to CKEditor with corresponding
   link behavior. See inspector and XML output for expected results.

9. Undo the previous action. All attributes set should have been removed.

### LT#003: Add Link to Selection

Similar to LT#002 but having an expanded selection: select some text and apply
changes regarding link/target combinations.

The selection should remain.

### LT#004: Edit Link With Target (No Selection; Collapsed)

Testing especially a challenging path in `LinkTargetCommand` when the URL has
not been changed, as this triggers no changes we could listen to.

1. Place the cursor into an existing link (with and without target previously set).

2. Choose to edit the link.

3. Repeat for the following scenarios:

    The following test-cases don't explicitly mention values but meta-states.
    Thus, _"set"_ represents any value set before and _"changed"_ represents a
    value, which got changed. 
    _B_ denotes value before, _A_ denotes value after editing.
    Expected state columns are: `linkHref` and `linkTarget`.
    🔗 represents the link value, while 🎯 represents the target value.

   | #   | 🔗 B    | 🔗 A         | 🎯 B    | 🎯 A        | `linkHref`  | `linkTarget`    |
   | --- | ------- | ----------- | ------- | ----------- | ----------- | --------------- |
   |  01 | _set_   | _unchanged_ | _set_   | _unchanged_ | _unchanged_ | _unchanged_     |
   |  02 | _set_   | _unchanged_ | _set_   | _changed_   | _unchanged_ | _changed_       |
   |  03 | _set_   | _unchanged_ | _set_   | _emptied_   | _unchanged_ | _unset_         |
   |  04 | _set_   | _changed_   | _set_   | _unchanged_ | _changed_   | _unchanged_     |
   |  05 | _set_   | _changed_   | _set_   | _changed_   | _changed_   | _changed_       |
   |  06 | _unset_ | _unchanged_ | _unset_ | _unchanged_ | _unchanged_ | _unchanged_     |
   |  07 | _unset_ | _unchanged_ | _unset_ | _changed_   | _unchanged_ | **_unchanged_** |
   |  08 | _unset_ | _changed_   | _unset_ | _unchanged_ | _changed_   | _unchanged_     |
   |  09 | _unset_ | _changed_   | _unset_ | _changed_   | _changed_   | _changed_       |
   |  10 | _set_   | _emptied_   | _set_   | _unchanged_ | _changed_   | _unchanged_     |
   |  11 | _set_   | _emptied_   | _set_   | _changed_   | _changed_   | _changed_       |
   |  12 | _set_   | _emptied_   | _set_   | _emptied_   | _changed_   | _unset_         |

### LT#004: Edit Link With Target (Link Selected)

This is expected to behave the same way as
_LT#004: Edit Link With Target (No Selection; Collapsed)_. Just select
the whole link and apply some changes from above — not necessarily the whole
set of combinations.

### LT#005: Edit Link With Target (Partial Link Selected)

Having an existing link with our without target, select some part of the link.
Set some target behavior.

In the result the previous single text node with linkHref attribute should have
been split into several parts (two to three depending on your selection). Only
the selected part got the target attribute updated.

### LT#006: Unlink

Unlinking should always also remove the `linkTarget` attribute.

### LT#007 Undo &amp; Redo

See LT#G3: Repeat or enhance the tests above by undo &amp; redo, i.e., ensure,
that all performed editing actions can be undone and redone with one single
undo/redo step.

See LT#G4: For any "no changes" actions, no undo step should be recorded.

Also try to type after undoing any link action. No `linkTarget` should be added.

### LT#008: View Target

In any of the created links set the cursor into the link and see, if a target
is displayed in the balloon. If the target is empty, no target information
should be shown.

**Possible Design Change:** If to display a target or some icon, or not to even
display the target at all is up to design decisions and may change over time.

### LT#009: Clear Target on New Link

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
⚡ **Not done yet:** In the first PoC having only a String property editor, this
does not work yet. It is meant to be fixed along with new UI elements in the
upcoming phase.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

1. Place the cursor at any position having nothing selected.

2. Press link-button in toolbar.

3. Set no link, but a target and submit. — no link should be added (see LT#001).

4. Press link-button in toolbar.

The `linkTarget` field/state should be empty (or default), i.e., previously
entered target should have been cleared.

**Possible Design Change:** This expectation is open to design changes, as
we may want to remember the previously selected target. Introducing such
a feature may come with additional requirements, like providing a store API
to store previously selected targets in user preferences of a CoreMedia Studio
user.

[ckeditor/ckeditor5-link]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
