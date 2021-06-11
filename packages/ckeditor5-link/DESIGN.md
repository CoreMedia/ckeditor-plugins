Link Feature Extension Design
================================================================================

CKEditor 24.x (to 27.x and most likely upcoming) provides a rather sparse
configuration as well as extension API. This is why designing support for
`target` attribute (which is taken as example in this document) was so
challenging back in 2021. For details see CKEditor Issue
[#9730][ckeditor/ckeditor5/issue/9730].

In this document we try to explain the details of the integration, required
to understand the processing.

**Not discussing `target` attribute here:** This document is not about
discussing if the `target` attribute should be used or not in modern HTML.

Link Plugin Not Extensible
--------------------------------------------------------------------------------

CKEditor's [`Link` feature][ckeditor/ckeditor5/feature/link] provides only
boolean attributes to be added to a link, so-called _manual decorators_.
This is enough for `target` attribute handling, if you only want to provide
two states like "open at `_self`" (default) or "open at `_blank`" (toggled).

As the `target` attribute may take any string, this restriction is not always
acceptable.

The challenges to extend the `Link` feature start at the UI-level, i.e. where
to add your component, especially if you want to integrate well with manual
decorators, which, if added, change the editing form from horizontal to
vertical layout.

More challenges are on command/model layer:

* **No Events:** Commands like `LinkCommand` and `UnlinkCommand` do not provide
    any more events than the default command events like `execute`.

* **UI Closed Without Notice:** The `LinkCommand` closes the UI without any
    notice, which is, if you want to access fields, you have to do that before
    `LinkCommand` executes.

* **May Insert Content:** In a collapsed selection (i.e. no text selected)
    `LinkCommand` may decide to insert content by itself, which will be just
    the entered link as plain text (and with `href` attribute of course).
    This makes it impossible for naive approaches to set additional attributes
    for links _before_ the command execution. And, if doing it afterwards, you
    will create two history items in the
    [`Undo` feature][ckeditor/ckeditor5/api/undo].

* **Set Selection:** As well as the `LinkCommand` may insert text, it may
    (or will) update the selection after execution. Having this, any naive
    hook into the command execution, which is triggered _after_ `LinkCommand`
    may have issues to guess the previous selection and thus, the ranges to
    update.

* **No Access To Ranges:** There is no way to access the evaluation for ranges
    to apply attribute changes to, neither within `LinkCommand` nor for
    `UnlinkCommand`. As a result, we have to guess the ranges on our own,
    which essentially means to _copy &amp; paste_ the behavior from the original
    commands to some extend.

* **No Changes For No Changes:** Which may sound trivial, is tricky to some
    extent: If you open the form view and submit it without having changed
    for example the `href` attribute, `LinkCommand` will not trigger any
    changes, which can be found in the [`Differ`][ckeditor/ckeditor5/api/differ]
    later on for example. For any custom attributes we cannot rely on
    the `linkHref` attribute being changed to hook into it to apply our
    changes to our custom attribute(s).

Overview Target Attribute Design
--------------------------------------------------------------------------------

Having the challenges from above, the general approach can be sketched like
this:

* **Store UI Values Soon:** We listen to the `submit` event of the form view
    and ensure, that we run prior to the `LinkCommand` execution. In this
    phase, we just store the values from the UI we want to apply later.
    It makes our `LinkTargetCommand` a dummy command, which does nothing but
    to prepare for possibly setting attributes later on.

* **Do Change in Post-Fixer:** Instead of directly writing to the model before
    or after `LinkCommand` execution, we apply any changes as _post-fix_ to
    the model. This guarantees, that the changes only create one history
    entry, i.e. only one click to _Undo_ will revert both attribute changes,
    that of `href` as well as our `target` attribute change.

    Similar to that we integrate with `UnlinkCommand`: We search for any
    `linkHref` attributes removed from the text, and assume, that also any
    custom attributes, such as `target` should be removed.

* **Fallback to Direct-Write:** If for any reason (unchanged `href` attribute
    for example), no change got triggered (which also means: no post-fixer
    will be triggered), we have to ensure to still write changes to our
    custom attribute to the model. In this case, we need to directly write
    to the model.

Example: Set Link Attributes for Selected Text
--------------------------------------------------------------------------------

Here is a step-by-step description what will happen, if you select a text,
open the link editor and insert a link as well as a target:

1. `submit` event is triggered.

2. `LinkTargetCommand` stores relevant data from UI:

    * `target` value
    * affected range(s) to apply attribute to

3. `LinkCommand` executes and sets `href` attribute.

4. Model triggers all registered post-fixers.

5. `LinkTargetCommand` gets triggered as post-fixer and uses the stored
    `target` and range to apply the attributes.

Challenges of Target Attribute Design
--------------------------------------------------------------------------------

While not relying on private API of the
[`Link` feature][ckeditor/ckeditor5/feature/link], we depend on the behavior
of the `LinkCommand`. This is, as we have for example no access to the range
calculation to apply our attributes to, we have to copy the algorithms from
`LinkCommand`. If at any time this algorithm changes, the `target` command may
fail to get the correct ranges.

Similar to that, we do not benefit from any bug fixes to `LinkCommand` as can
be found in `LinkEditing` class (as of writing this): There are several
workarounds for editing actions, like deleting text directly after a link.
This is related to reported issues in the past, and we need to ensure to
provide similar robustness.

Future Challenges For More Attributes
--------------------------------------------------------------------------------

At the time of writing it is foreseeable, that we will have similar challenges
for even more attributes to add. A `title` attribute for example needs to
take the same/similar path as the `target` attribute. This may (or will) require
to provide a more general "patch API" to hook into the `LinkCommand`.

<!-- References -->

[ckeditor/ckeditor5/api/differ]: <https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_differ.html> "Module engine/model/differ - CKEditor 5 API docs"
[ckeditor/ckeditor5/api/undo]: <https://ckeditor.com/docs/ckeditor5/latest/api/undo.html> "CKEditor 5 undo feature - CKEditor 5 API docs"
[ckeditor/ckeditor5/feature/link]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
[ckeditor/ckeditor5/issue/9730]: <https://github.com/ckeditor/ckeditor5/issues/9730> "LinkCommand should provide extension point for custom text attributes (linkTarget or similar) · Issue #9730 · ckeditor/ckeditor5"
