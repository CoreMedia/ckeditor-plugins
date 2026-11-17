# @coremedia/ckeditor5-coremedia-differencing

## 29.0.0

### Major Changes

- 4d69050: Require CKEditor 5 v49: the `ckeditor5` peer dependency changes from 48.5.2 to 49.0.1. Update `ckeditor5` to 49.0.1 together with these packages and follow the CKEditor 5 v49 migration guide. For example, `@ckeditor/ckeditor5-theme-lark` is no longer needed, as the theme ships with `ckeditor5/ckeditor5.css`, and design tokens replace the flat set of `--ck-*` custom properties. Plugin styles read the new design tokens and still honor overrides of the legacy `--ck-*` names.

### Patch Changes

- Updated dependencies [4d69050]
  - @coremedia/ckeditor5-common@29.0.0
  - @coremedia/ckeditor5-core-common@29.0.0
  - @coremedia/ckeditor5-coremedia-richtext@29.0.0
  - @coremedia/ckeditor5-dom-converter@29.0.0
  - @coremedia/ckeditor5-dom-support@29.0.0
  - @coremedia/ckeditor5-logging@29.0.0

## 28.1.2

### Patch Changes

- @coremedia/ckeditor5-common@28.1.2
  - @coremedia/ckeditor5-core-common@28.1.2
  - @coremedia/ckeditor5-coremedia-richtext@28.1.2
  - @coremedia/ckeditor5-dom-converter@28.1.2
  - @coremedia/ckeditor5-dom-support@28.1.2
  - @coremedia/ckeditor5-logging@28.1.2
