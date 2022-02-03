# API Documentation

_CoreMedia's CKEditor 5 Plugins_ provides plugins for CKEditor 5 with focus on integration into CoreMedia CMS.

## Main Packages

All packages are published with scope `@coremedia/` as for example
`@coremedia/ckeditor5-coremedia-link`.

| Name                                     | Description                                                |
|------------------------------------------|------------------------------------------------------------|
| `ckeditor5-coremedia-content-clipboard`  | Extension to CKEditor 5 Clipboard Feature for CoreMedia Contents  |
| `ckeditor5-coremedia-link`               | Extension to CKEditor 5 Link Feature                       |
| `ckeditor5-coremedia-richtext`           | Data-Processing for CoreMedia RichText 1.0 DTD             |
| `ckeditor5-coremedia-richtext-support`   | Support for CoreMedia RichText 1.0 DTD                     |
| `ckeditor5-coremedia-studio-essentials`  | Aggregator for essential plugins in CoreMedia Studio       |
| `ckeditor5-coremedia-studio-integration` | Communication Facade for integration into CoreMedia Studio |
| `ckeditor5-symbol-on-paste-mapper`       | Extension to CKEditor 5 Paste-from-Office                  |

The subtle difference between `ckeditor5-coremedia-richtext` and
`ckeditor5-coremedia-richtext-support` is, that the latter one just adds support for attributes from CoreMedia RichText
for which no editing actions are configured
(yet). Simply speaking, `ckeditor5-coremedia-richtext` ensures, that data can be read and stored on server,
while `ckeditor5-coremedia-richtext-support` ensures, that all valid CoreMedia RichText attributes are registered as _
valid_ within CKEditor. For details see the corresponding documentation.

## Assistive Packages

All packages are published with scope `@coremedia/` as for example
`@coremedia/ckeditor5-logging`.

| Name                              | Description                                      |
|-----------------------------------|--------------------------------------------------|
| `ckeditor5-dataprocessor-support` | Support for providing a CKEditor 5 DataProcessor |
| `ckeditor5-logging`               | Logging Facade                                   |

## Private Packages

The following packages are not published, and thus, may only be used as
`devDependencies`. Use scope `@coremedia/` as for example
`@coremedia/ckeditor5-jest-test-helpers`.

| Name                                          | Description                                 |
|-----------------------------------------------|---------------------------------------------|
| `ckeditor5-coremedia-studio-integration-mock` | Simulates integration into CoreMedia Studio |
| `ckeditor5-jest-test-helpers`                 | Support for JEST tests; not part of API     |
