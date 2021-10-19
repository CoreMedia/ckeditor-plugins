# CoreMedia CKEditor 5 Plugins

[![License: Apache 2.0][badge:license:Apache2]](./LICENSE)

_CoreMedia's CKEditor 5 Plugins_ provides plugins for [CKEditor 5][] with focus
on integration into [CoreMedia CMS][]. CKEditor 5 is going to replace the
previous integration of [CKEditor 4][].

As the CKEditor 5 integration into CoreMedia CMS is not yet feature-complete,
it is provided as early-bird to customers of CoreMedia CMS to pre-evaluate the
future of CKEditor within the CMS.

## Quick Start

```text
$ pnpm install
$ pnpm run build
```

Open `app/sample/index.html` to open an example CKEditor 5 with all provided
plugins enabled.

## Main Packages

All packages are published with scope `@coremedia/` as for example
`@coremedia/ckeditor5-coremedia-link`.

| Name                                         | Description                                                |
| -------------------------------------------- | ---------------------------------------------------------- |
| [`ckeditor5-coremedia-link`][]               | Extension to CKEditor 5 Link Feature                       |
| [`ckeditor5-coremedia-richtext`][]           | Support for CoreMedia RichText 1.0 DTD                     |
| [`ckeditor5-coremedia-studio-essentials`][]  | Aggregator for essential plugins in CoreMedia Studio       |
| [`ckeditor5-coremedia-studio-integration`][] | Communication Facade for integration into CoreMedia Studio |
| [`ckeditor5-symbol-on-paste-mapper`][]       | Extension to CKEditor 5 Paste-from-Office                  |

## Assistive Packages

All packages are published with scope `@coremedia/` as for example
`@coremedia/ckeditor5-logging`.

| Name                                  | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| [`ckeditor5-dataprocessor-support`][] | Support for providing a CKEditor 5 DataProcessor |
| [`ckeditor5-logging`][]               | Logging Facade                                   |

## Private Packages

The following packages are not published, and thus, may only be used as
`devDependencies`. Use scope `@coremedia/` as for example
`@coremedia/ckeditor5-jest-test-helpers`.

| Name                                              | Description                                 |
| ------------------------------------------------- | ------------------------------------------- |
| [`ckeditor5-coremedia-studio-integration-mock`][] | Simulates integration into CoreMedia Studio |
| [`ckeditor5-jest-test-helpers`][]                 | Support for JEST tests                      |

## See Also

* **[GitHub Pages][gp:ckeditor-plugins]:** These pages on GitHub Pages.
* **[Development](./DEVELOPMENT.md):** Hints for developing within this workspace
* **[License](./LICENSE):** Apache 2.0 License Text
* **[Versioning](./VERSIONING.md):** Versioning Policy

<!-- ===========================================================[References] -->

[`ckeditor5-coremedia-link`]: <./packages/ckeditor5-coremedia-link/>
[`ckeditor5-coremedia-richtext`]: <./packages/ckeditor5-coremedia-richtext/>
[`ckeditor5-coremedia-studio-essentials`]: <./packages/ckeditor5-coremedia-studio-essentials/>
[`ckeditor5-coremedia-studio-integration`]: <./packages/ckeditor5-coremedia-studio-integration/>
[`ckeditor5-coremedia-studio-integration-mock`]: <./packages/ckeditor5-coremedia-studio-integration-mock/>
[`ckeditor5-dataprocessor-support`]: <./packages/ckeditor5-dataprocessor-support/>
[`ckeditor5-jest-test-helpers`]: <./packages/ckeditor5-jest-test-helpers>
[`ckeditor5-logging`]: <./packages/ckeditor5-logging/>
[`ckeditor5-symbol-on-paste-mapper`]: <./packages/ckeditor5-symbol-on-paste-mapper/>
[badge:license:Apache2]: <https://img.shields.io/badge/license-Apache_2.0-blue?style=for-the-badge>
[CKEditor 4]: <https://ckeditor.com/ckeditor-4/> "CKEditor 4 | Visual Text Editor for HTML"
[CKEditor 5]: <https://ckeditor.com/ckeditor-5/> "CKEditor 5 | Powerful Framework with Modular Architecture"
[CoreMedia CMS]: <https://www.coremedia.com/> "Best-of-Breed Digital Experience Platform CoreMedia"
[gp:ckeditor-plugins]: <https://coremedia.github.io/ckeditor-plugins/>
