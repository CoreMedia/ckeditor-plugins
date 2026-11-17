# @coremedia/ckeditor5-dialog-visibility

## 29.0.0

### Major Changes

- 4d69050: Require CKEditor 5 v49: the `ckeditor5` peer dependency changes from 48.5.2 to 49.0.1. Update `ckeditor5` to 49.0.1 together with these packages and follow the CKEditor 5 v49 migration guide. For example, `@ckeditor/ckeditor5-theme-lark` is no longer needed, as the theme ships with `ckeditor5/ckeditor5.css`, and design tokens replace the flat set of `--ck-*` custom properties. Plugin styles read the new design tokens and still honor overrides of the legacy `--ck-*` names.

## 28.1.2

No changes in this release.
