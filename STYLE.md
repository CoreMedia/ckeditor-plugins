# Styleguide

While the codestyle is mostly controlled by [ESLint][], there are some
exceptions which are not controlled by the linter. This purpose of this
styleguide is to provide some consistent appearence of the code, so that
you can get used to the patterns while reading it.

> This styleguide is open for discussion.

* [TypeScript][]

    * [Private Members][]
    * [Logger][]

* [Markdown][]

    * [Links][]
    * [Table of Contents][]

* [Packages][]

    * [Package Names][]
    * [Package Scopes][]
    * [Private Packages][]

## TypeScript

[TypeScript]: <#typescript>

[[Top][]|[TypeScript][]|[Markdown][]|[Packages][]]

### Private Members

[Private Members]: <#private-members>
[ts:Private]: <#private-members>

[[Top][]|[Up][TypeScript]|[Private][ts:Private]|[Logger][]]

Instead of using TypeScript's keyword `private` we use the hash-syntax (`#`) as
[introduced for JavaScript][mdn:private], because of much stricter
access-control.

### Logger

[Logger]: <#logger>

[[Top][]|[Up][TypeScript]|[Private][ts:Private]|[Logger][]]

`@coremedia/ckeditor5-logging` provides a logging feature, which allows to control
logging details via hash parameter in the URL.

A logger is assigned at the top of a class in need of a logger:

```typescript
class MyClass {
  static readonly #logger: Logger = LoggerProvider.getLogger("MyClass");
  // ...
}
```

For shorter usage in code and to prevent lengthy static references, prior to
using a logger, an alias is defined:

```typescript
const logger = MyClass.#logger;

logger.warn("A warning");
logger.info("Some information");
```

## Markdown

[Markdown]: <#markdown>

[[Top][]|[TypeScript][]|[Markdown][]|[Packages][]]

Documentation (including inline documentation in TypeScript) is formatted using
Markdown.

### Links

[Links]: <#links>

[[Top][]|[Up][Markdown]|[Links][]|[ToC][]]

The reference-style is the preferred syntax for links outside of inline
documentation. If possible, words are preferred as references.

```markdown
[Markdown][]

[some markdown][Markdown]

[private hash syntax][mdn:private]

[Markdown]:
  <https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet>
  "Markdown Cheatsheet · adam-p/markdown-here Wiki"
[mdn:private]:
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields>
  "Private class features - JavaScript | MDN"
```

In general, references should be resolved at the end of the document. To shorten
lines, references-catalogs may be wrapped as proposed in the above example.

### Table of Contents

[Table of Contents]: <#table-of-contents>
[ToC]: <#table-of-contents> "Table of Contents"

[[Top][]|[Up][Markdown]|[Links][]|[ToC][]]

For larger documents you may introduce a table of contents and some navigation
between elements. The following is a suggestion how you may achieve this.
In general, it expects, that named anchors are created automatically based on
headings, as done for GitHub flavored Markdown for example.

```markdown
# The Title

* [Section 1][]
    * [Section 1.1][]
* [Section 2][]

## Section 1

[Section 1]: <#section-1>
[Alias 1]: <#section-1>

[[Top][]|[Section 1][]|[Section 2][]]

### Sub Section 1.1

[Section 1.1]: <#section-11>

[[Top][]|[Up][Section 1]|[Section 1.1][]|[Section 1.2][]]

### Sub Section 1.2

[Section 1.2]: <#section-12>

[[Top][]|[Up][Section 1]|[Section 1.1][]|[Section 1.2][]]

## Section 2

[Section 2]: <#section-2>

[[Top][]|[Section 1][]|[Section 2][]]


[Top]: <#top> "HTML reference for 'top of document'"

```

## Packages

[Packages]: <#packages>

[[Top][]|[TypeScript][]|[Markdown][]|[Packages][]]

### Package Names

[Package Names]: <#package-names>
[Names]: <#package-names>

[[Top][]|[Up][Packages]|[Names][]|[Scopes][]|[Private][pkg:Private]]

* The folder name of a package should be the same as the package name.

* All packages must be prefixed with `ckeditor5`.

    This is required to prevent clashes with artifacts having the same scope.

* All packages containing code related to CoreMedia CMS must contain `coremedia`.

    This is at second position, separated by a dash: `ckeditor5-coremedia-*`.

* Typing packages must be prefixed with `types-`.

    The complete name for a typing package is `types-<scope>__<package name>`
    (two underscores as separator).
    Thus, it is similar to typings at [DefinitelyTyped][]. The folder name,
    in contrast to the role above, is just `<scope>__<package name>`

### Package Scopes

[Package Scopes]: <#package-scopes>
[Scopes]: <#package-scopes>

[[Top][]|[Up][Packages]|[Names][]|[Scopes][]|[Private][pkg:Private]]

* For public packages, the scope `@coremedia` must be used.

    This allows using common repository mappings within `.npmrc` and others.

* For [Private Packages][], the scope `@coremedia-internal` must be used.

### Private Packages

[Private Packages]: <#private-packages>
[pkg:Private]: <#private-packages>

[[Top][]|[Up][Packages]|[Names][]|[Scopes][]|[Private][pkg:Private]]

* Private or _internal_ packages are only meant for use within this repository.

* Private packages must only be used as developer dependencies.

* As stated in [Package Scopes][], private packages must use scope `@coremedia-internal`.

* Private package always have a fixed version `1.0.0` which does not update on release.

<!-- Last Navigation Entry -->

[[Top][]|[TypeScript][]|[Markdown][]|[Packages][]]

<!--
--------------------------------------------------------------------------------
References
--------------------------------------------------------------------------------
-->

[DefinitelyTyped]:
  <https://github.com/DefinitelyTyped/DefinitelyTyped>
  "DefinitelyTyped/DefinitelyTyped: The repository for high quality TypeScript type definitions."
[ESLint]:
  <https://eslint.org/>
  "ESLint - Pluggable JavaScript linter"
[mdn:private]:
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields>
  "Private class features - JavaScript | MDN"
[Top]:
  <#top>
  "Jump to top of document"
