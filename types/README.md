# CKEditor Type Definitions

This directory contains type definitions for CKEditor. While a
[request][ckeditor5-issue-504] exists since 2017 to provide type definitions for
CKEditor, no progress has been made even after 4 years or more. Projects like
[DefinitelyTyped][] provide an alternative, but only rudimentary typings for
CKEditor 5 exist — and those, which exist, are not up-to-date.

That is, why we decided to create a custom set of typings in here. They are meant
to only cover those parts of the API we are using — and may contain adaptions
where required.

## Adaptions

As JavaScript is not strongly typed, it is easy breaking contracts in
(documented) declarations. One first example we observed was
`HtmlWriter`, which told to accept `dom:DocumentFragment` as input to
`getHtml`. Analyzing the code, we found that it instead at least accepts
`dom:Node` in addition to that. We adjusted the type definition accordingly.

In the following you will find a list of adaptions we made. Each adaption
should have a comment in typings explaining, why the adaption has been made.

* `HtmlWriter.getHtml`

## Name Conflicts: dom:Element vs. view:Element et al.

CKEditor 5 comes with classes `Element`, `Node`, `DocumentFragment` et al.
While they share the same name as well-known DOM objects, they are not
compatible.

To increase awareness of these differences, we decided to prefix such classes
in import statements with the corresponding package name. Thus, `Element`
becomes `ViewElement` for example.

To use an alias you may use the following concepts:

```typescript
import MyAliasForDefaultExport from "@ckeditor/ckeditor5-something/src/somewhere";
```

for all default exports, and

```typescript
import { ToAlias as MyAlias } from "@ckeditor/ckeditor5-something/src/somewhere";
```

for any other.

## See Also

* [API documentation - CKEditor 5 API docs][ckeditor5-api-doc]

* [Typings for TypeScript · Issue #504 · ckeditor/ckeditor5][ckeditor5-issue-504]

*  [DefinitelyTyped/DefinitelyTyped: The repository for high quality TypeScript type definitions.][DefinitelyTyped]

    * [DefinitelyTyped/types/ckeditor__ckeditor5-core](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ckeditor__ckeditor5-core)
    * [DefinitelyTyped/types/ckeditor__ckeditor5-utils](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ckeditor__ckeditor5-utils)
    * [DefinitelyTyped/types/ckeditor__ckeditor5-engine at master](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ckeditor__ckeditor5-engine)

[ckeditor5-api-doc]: <https://ckeditor.com/docs/ckeditor5/latest/api/index.html> "API documentation - CKEditor 5 API docs"
[ckeditor5-issue-504]: <https://github.com/ckeditor/ckeditor5/issues/504> "Typings for TypeScript · Issue #504 · ckeditor/ckeditor5"
[DefinitelyTyped]: <https://github.com/DefinitelyTyped/DefinitelyTyped> "DefinitelyTyped/DefinitelyTyped: The repository for high quality TypeScript type definitions."
