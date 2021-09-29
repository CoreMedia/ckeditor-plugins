# CoreMedia CKEditor 5 Plugins

![License: Apache 2.0][badge:license:Apache2]

_CoreMedia's CKEditor 5 Plugins_ provides plugins for [CKEditor 5][] with focus
on integration into [CoreMedia CMS][]. CKEditor 5 is going to replace the
previous integration of [CKEditor 4][].

As the the CKEditor 5 integration into CoreMedia CMS is not yet feature-complete,
it is provided as early-bird to customers of CoreMedia CMS to pre-evaluate the
future of CKEditor within the CMS.

## Main Packages

| Name                                                    | Description                                                |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| [`@coremedia/ckeditor5-coremedia-link`][]               | Extension to CKEditor 5 Link Feature                       |
| [`@coremedia/ckeditor5-coremedia-richtext`][]           | Support for CoreMedia RichText 1.0 DTD                     |
| [`@coremedia/ckeditor5-coremedia-studio-essentials`][]  | Aggregator for essential plugins in CoreMedia Studio       |
| [`@coremedia/ckeditor5-coremedia-studio-integration`][] | Communication Facade for integration into CoreMedia Studio |
| [`@coremedia/ckeditor5-symbol-on-paste-mapper`][]       | Extension to CKEditor 5 Paste-from-Office                  |

## Assistive Packages

| Name                                             | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| [`@coremedia/ckeditor5-dataprocessor-support`][] | Support for providing a CKEditor 5 DataProcessor |
| [`@coremedia/ckeditor5-logging`][]               | Logging Facade                                   |

## Private Packages

The following packages are not published, and thus, may only be used as
`devDependencies`.

| Name                                                         | Description                                 |
| ------------------------------------------------------------ | ------------------------------------------- |
| [`@coremedia/ckeditor5-coremedia-studio-integration-mock`][] | Simulates integration into CoreMedia Studio |
| [`@coremedia/ckeditor5-jest-test-helpers`][]                 | Support for JEST tests |

## See Also

* [Development][] – Hints for developing within this workspace
* [Versioning][] – Versioning Policy

<!-- ===========================================================[References] -->

[`@coremedia/ckeditor5-coremedia-link`]: <./packages/ckeditor5-coremedia-link/>
[`@coremedia/ckeditor5-coremedia-richtext`]: <./packages/ckeditor5-coremedia-richtext/>
[`@coremedia/ckeditor5-coremedia-studio-essentials`]: <./packages/ckeditor5-coremedia-studio-essentials/>
[`@coremedia/ckeditor5-coremedia-studio-integration`]: <./packages/ckeditor5-coremedia-studio-integration/>
[`@coremedia/ckeditor5-coremedia-studio-integration-mock`]: <./packages/ckeditor5-coremedia-studio-integration-mock/>
[`@coremedia/ckeditor5-dataprocessor-support`]: <./packages/ckeditor5-dataprocessor-support/>
[`@coremedia/ckeditor5-jest-test-helpers`]: <./packages/ckeditor5-jest-test-helpers>
[`@coremedia/ckeditor5-logging`]: <./packages/ckeditor5-logging/>
[`@coremedia/ckeditor5-symbol-on-paste-mapper`]: <./packages/ckeditor5-symbol-on-paste-mapper/>
[badge:license:Apache2]: <https://img.shields.io/badge/license-Apache_2.0-blue?style=for-the-badge>
[CKEditor 4]: <https://ckeditor.com/ckeditor-4/> "CKEditor 4 | Visual Text Editor for HTML"
[CKEditor 5]: <https://ckeditor.com/ckeditor-5/> "CKEditor 5 | Powerful Framework with Modular Architecture"
[CoreMedia CMS]: <https://www.coremedia.com/> "Best-of-Breed Digital Experience Platform CoreMedia"
[Development]: <./DEVELOPMENT.md> "Hints for developing within this workspace"
[Versioning]: <./VERSIONING.md> "Versioning Policy"
