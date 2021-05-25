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

### LT#001: Create Link With Target

1. Place the cursor at any position having nothing selected.

2. Press link-button in toolbar.

3. Repeat for all following combinations and submit to compare to expected
   results observed in CKEditor's Inspector:

    | Link             | Target    | Expected `linkHref` | Expected `linkTarget` | Comment               |
    | ---------------- | --------- | ------------------- | --------------------- | --------------------- |
    | `https://e.org/` | `example` | `https://e.org/`    | `example`             | Standard Use-Case     |
    | `https://e.org/` | _empty_   | `https://e.org/`    | _unset_               | LT#G2                 |
    | _empty_          | _empty_   | _unset_             | _unset_               | No-Operation Use-Case |
    | _empty_          | `example` | _unset_             | _unset_               | LT#G1                 |

4. **Extended Test for LT#G1:** If a target got set, continue typing after the
    link got set. The additional text must have neither `linkHref` set (default
    behavior of `LinkCommand`) nor `linkTarget`.

The cursor position should jump to the end of the added text (behavior of
`LinkCommand` which we should not break).

### LT#002: Add Link to Selection

Similar to LT#001, but instead of having no text selected (i.e. a so-called
_collapsed selection_), select some text and apply the same changes regarding
link/target combinations. The behavior should be similar to the above scenario.

The selection should remain.

### LT#003: Edit Link With Target (No Selection; Collapsed)

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
_LT#003: Edit Link With Target (No Selection; Collapsed)_. Just select
the whole link and 

### LT#005: Edit Link With Target (Partial Link Selected)

Test-cases missing yet. In general, it is about only selecting a part of an
existing link and adapting its setting. The behavior should be similar to
the `LinkCommand`, i.e. regarding the `linkHref` attribute.

### LT#006: Unlink

Unlinking should always also remove the `linkTarget` attribute.

### LT#007 Undo &amp; Redo

See LT#G3: Repeat or enhance the tests above by undo &amp; redo, i.e. ensure,
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

The `linkTarget` field/state should be empty (or default), i.e. previously
entered target should have been cleared.

**Possible Design Change:** This expectation is open to design changes, as
we may want to remember the previously selected target. Introducing such
a feature may come with additional requirements, like providing a store API
to store previously selected targets in user preferences of a CoreMedia Studio
user.

[ckeditor/ckeditor5-link]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
