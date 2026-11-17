---
"@coremedia/ckeditor5-bbcode": major
"@coremedia/ckeditor5-common": major
"@coremedia/ckeditor5-core-common": major
"@coremedia/ckeditor5-coremedia-blocklist": major
"@coremedia/ckeditor5-coremedia-content": major
"@coremedia/ckeditor5-coremedia-content-clipboard": major
"@coremedia/ckeditor5-coremedia-differencing": major
"@coremedia/ckeditor5-coremedia-images": major
"@coremedia/ckeditor5-coremedia-link": major
"@coremedia/ckeditor5-coremedia-richtext": major
"@coremedia/ckeditor5-coremedia-richtext-support": major
"@coremedia/ckeditor5-coremedia-studio-essentials": major
"@coremedia/ckeditor5-data-facade": major
"@coremedia/ckeditor5-dataprocessor-support": major
"@coremedia/ckeditor5-dialog-visibility": major
"@coremedia/ckeditor5-dom-converter": major
"@coremedia/ckeditor5-font-mapper": major
"@coremedia/ckeditor5-link-common": major
---

Require CKEditor 5 v49: the `ckeditor5` peer dependency changes from 48.5.2 to 49.0.1. Update `ckeditor5` to 49.0.1 together with these packages and follow the CKEditor 5 v49 migration guide. For example, `@ckeditor/ckeditor5-theme-lark` is no longer needed, as the theme ships with `ckeditor5/ckeditor5.css`, and design tokens replace the flat set of `--ck-*` custom properties. Plugin styles read the new design tokens and still honor overrides of the legacy `--ck-*` names.
