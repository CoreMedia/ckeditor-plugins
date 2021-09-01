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

## TypeScript

[TypeScript]: <#typescript>

[[Top][]|[TypeScript][]|[Markdown][]]

### Private Members

[Private Members]: <#private-members>
[Private]: <#private-members>

[[Top][]|[Up][TypeScript]|[Private][]|[Logger][]]

Instead of using TypeScript's keyword `private` we use the hash-syntax (`#`) as
[introduced for JavaScript][mdn:private], because of much stricter
access-control.

### Logger

[Logger]: <#logger>

[[Top][]|[Up][TypeScript]|[Private][]|[Logger][]]

`@coremedia/coremedia-utils` provides a logging feature, which allows to control
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

[[Top][]|[TypeScript][]|[Markdown][]]

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

<!--
--------------------------------------------------------------------------------
References
--------------------------------------------------------------------------------
-->

[ESLint]:
  <https://eslint.org/>
  "ESLint - Pluggable JavaScript linter"
[mdn:private]:
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields>
  "Private class features - JavaScript | MDN"
[Top]:
  <#top>
  "Jump to top of document"
