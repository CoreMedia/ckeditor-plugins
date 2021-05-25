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

### LT#002: Clear Target on New Link

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
⚡ **Not done yet:** In the first PoC having only a String property editor, this
does not work yet. It is meant to be fixed along with new UI elements in the
upcoming phase.
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

1. Place the cursor at any position having nothing selected.

2. Press link-button in toolbar.

3. Set no link, but a target and submit. – no link should be added (see LT#001).

4. Press link-button in toolbar.

The `linkTarget` field/state should be empty (or default), i.e. previously
entered target should have been cleared.

**Possible Design Change:** This expectation is open to design changes, as
we may want to remember the previously selected target. Introducing such
a feature may come with additional requirements, like providing a store API
to store previously selected targets in user preferences of a CoreMedia Studio
user.

[ckeditor/ckeditor5-link]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
