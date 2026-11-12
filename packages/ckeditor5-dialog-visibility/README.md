# CoreMedia Dialog Visibility Plugin

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_dialog_visibility.html> "@coremedia/ckeditor5-dialog-visibility"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-dialog-visibility`

Dialog Visibility is a Plugin, that fixes some issues, that occur with
the addition of the CKEditor dialog system, introduced with CKEditor 5 v41.0.0.

A Dialog is CKEditor's new modal type, that stays open, even if the user
triggers a click event outside of the editor. This may lead to some issues
in CoreMedia Studio: An opened dialog will stay opened during a tab switch,
when collapsing a parent card container or when scrolling the editor out
of the users view.

To fix these issues, this plugin hides the opened dialog when the CKEditor
is not visible anymore.
