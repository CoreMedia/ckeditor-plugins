# CoreMedia CKEditor 5 Plugins

[![License: Apache 2.0][badge:license:Apache2]](./LICENSE)
[![Documentation at GitHub Pages][badge:docs:GHPages]][gp:ckeditor-plugins]
[![API Documentation][badge:docs:api]][api:ckeditor-plugins]

_CoreMedia's CKEditor 5 Plugins_ provides plugins for [CKEditor 5][] with focus
on integration into [CoreMedia CMS][]. Since 2022 (CMS v2210.1) CKEditor 5
replaces the previous integration of [CKEditor 4][].

## Quick Start

```text
$ pnpm install
$ pnpm build
$ pnpm start
```

Note, that `pnpm install` requires access to `npm.coremedia.io`.

The last command will start a lightweight HTTP server and by default opens
`http://127.0.0.1:8080/sample/` (may vary, if port 8080 is in use) in your
default browser. It will provide a demo of the features providing by the
plugins contained in this workspace. As alternative, open
`app/sample/index.html` directly in your preferred browser.

## Main Packages

All packages are published with scope `@coremedia/` as for example
`@coremedia/ckeditor5-coremedia-link`.

| Name                                         | Description                                                      |
|----------------------------------------------|------------------------------------------------------------------|
| [`ckeditor5-coremedia-content-clipboard`][]  | Extension to CKEditor 5 Clipboard Feature for CoreMedia Contents |
| [`ckeditor5-coremedia-images`][]             | Support for CMS Blob References like Images                      |
| [`ckeditor5-coremedia-link`][]               | Extension to CKEditor 5 Link Feature                             |
| [`ckeditor5-coremedia-richtext`][]           | Data-Processing for CoreMedia RichText 1.0 DTD                   |
| [`ckeditor5-coremedia-richtext-support`][]   | Support for CoreMedia RichText 1.0 DTD                           |
| [`ckeditor5-coremedia-studio-essentials`][]  | Aggregator for essential plugins in CoreMedia Studio             |
| [`ckeditor5-coremedia-studio-integration`][] | Communication Facade for integration into CoreMedia Studio       |
| [`ckeditor5-symbol-on-paste-mapper`][]       | Extension to CKEditor 5 Paste-from-Office                        |

The subtle difference between `ckeditor5-coremedia-richtext` and
`ckeditor5-coremedia-richtext-support` is, that the latter one just adds support
for attributes from CoreMedia RichText for which no editing actions are configured
(yet). Simply speaking, `ckeditor5-coremedia-richtext` ensures, that data can be
read and stored on server, while `ckeditor5-coremedia-richtext-support` ensures,
that all valid CoreMedia RichText attributes are registered as _valid_ within
CKEditor. For details see the corresponding documentation.

## Assistive Packages

All packages are published with scope `@coremedia/` as for example
`@coremedia/ckeditor5-logging`.

| Name                                  | Description                                      |
|---------------------------------------|--------------------------------------------------|
| [`ckeditor5-common`][]                | Common Utilities                                 |
| [`ckeditor5-dataprocessor-support`][] | Support for providing a CKEditor 5 DataProcessor |
| [`ckeditor5-logging`][]               | Logging Facade                                   |

## Private Packages

The following packages are not published, and thus, may only be used as
`devDependencies`. Use scope `@coremedia/` as for example
`@coremedia/ckeditor5-jest-test-helpers`.

| Name                                              | Description                                 |
|---------------------------------------------------|---------------------------------------------|
| [`ckeditor5-coremedia-studio-integration-mock`][] | Simulates integration into CoreMedia Studio |
| [`ckeditor5-jest-test-helpers`][]                 | Support for JEST tests                      |

## See Also

* **[GitHub Pages][gp:ckeditor-plugins]:** These pages on GitHub Pages.
* **[API Documentation][api:ckeditor-plugins]: API Documentation
* **[Development](./DEVELOPMENT.md):** Hints for developing within this workspace
* **[License](./LICENSE):** Apache 2.0 License Text
* **[Versioning](./VERSIONING.md):** Versioning Policy

<!-- ===========================================================[References] -->

[`ckeditor5-common`]: <./packages/ckeditor5-coremedia-content-clipboard>
[`ckeditor5-coremedia-content-clipboard`]: <./packages/ckeditor5-coremedia-content-clipboard>
[`ckeditor5-coremedia-images`]: <./packages/ckeditor5-coremedia-images>
[`ckeditor5-coremedia-link`]: <./packages/ckeditor5-coremedia-link>
[`ckeditor5-coremedia-richtext`]: <./packages/ckeditor5-coremedia-richtext>
[`ckeditor5-coremedia-richtext-support`]: <./packages/ckeditor5-coremedia-richtext-support>
[`ckeditor5-coremedia-studio-essentials`]: <./packages/ckeditor5-coremedia-studio-essentials>
[`ckeditor5-coremedia-studio-integration`]: <./packages/ckeditor5-coremedia-studio-integration>
[`ckeditor5-coremedia-studio-integration-mock`]: <./packages/ckeditor5-coremedia-studio-integration-mock>
[`ckeditor5-dataprocessor-support`]: <./packages/ckeditor5-dataprocessor-support>
[`ckeditor5-jest-test-helpers`]: <./packages/ckeditor5-jest-test-helpers>
[`ckeditor5-logging`]: <./packages/ckeditor5-logging>
[`ckeditor5-symbol-on-paste-mapper`]: <./packages/ckeditor5-symbol-on-paste-mapper>
[api:ckeditor-plugins]: <https://coremedia.github.io/ckeditor-plugins/docs/api/> "CoreMedia CKEditor 5 Plugins – API Documentation"
[badge:docs:api]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>
[badge:docs:GHPages]: <https://img.shields.io/badge/docs-%F0%9F%93%9D%20GH%20Pages-informational?style=for-the-badge>
[badge:license:Apache2]: <https://img.shields.io/badge/license-Apache_2.0-blue?style=for-the-badge>
[CKEditor 4]: <https://ckeditor.com/ckeditor-4/> "CKEditor 4 | Visual Text Editor for HTML"
[CKEditor 5]: <https://ckeditor.com/ckeditor-5/> "CKEditor 5 | Powerful Framework with Modular Architecture"
[CoreMedia CMS]: <https://www.coremedia.com/> "Best-of-Breed Digital Experience Platform CoreMedia"
[gp:ckeditor-plugins]: <https://coremedia.github.io/ckeditor-plugins/>  "CoreMedia CKEditor 5 Plugins – GitHub Pages"
