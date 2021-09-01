# Styleguide

While the codestyle is mostly controlled by [ESLint][], there are some
exceptions which are not controlled by the linter. This purpose of this
styleguide is to provide some consistent appearence of the code, so that
you can get used to the patterns while reading it.

> This styleguide is open for discussion.

## TypeScript

### Private Members

Instead of using TypeScript's keyword `private` we use the hash-syntax (`#`) as
[introduced for JavaScript][mdn:private], because of much stricter
access-control.

### Logger

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

<!--
--------------------------------------------------------------------------------
References
--------------------------------------------------------------------------------
-->

[ESLint]: <https://eslint.org/> "ESLint - Pluggable JavaScript linter"
[mdn:private]: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields> "Private class features - JavaScript | MDN"
