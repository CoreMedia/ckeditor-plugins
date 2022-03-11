# Styleguide for TypeScript

## Classes

* **Private Members:** Use `#` for private member declaration in favor of
  `private`.

## Exports

* **Named Exports:** For consistency, use named, in-place simple exports. Thus,
  do not use default exports and do not group them in a single export statement
  at the end.

* **No Default Export:** For consistency and less friction with TSDoc/Typedoc,
  use named exports rather than default exports.

## Logging

* **Use Logger:** For logging, us the logger provided by
  `@coremedia/ckeditor5-logging`.

* **Logger Instance:** Declare logger as

  ```typescript
  class MyClass {
    static readonly #logger: Logger = LoggerProvider.getLogger("MyClass");
    // ...
  }
  ```

* **Logger Usage:** Prefer _alias_ via `const` for logger usage, especially when
  used multiple times:

  ```typescript
  const logger = MyClass.#logger;

  logger.warn("A warning");
  logger.info("Some information");
  ```

## Packages

* **Package Names:**

  * The folder name of a package should be the same as the package name.

  * All packages must be prefixed with `ckeditor5`.

  * All packages containing code related to CoreMedia CMS must contain
    `coremedia`.

    This is at second position, separated by a dash: `ckeditor5-coremedia-*`.

  * Typing packages must be prefixed with `types-`.

    The complete name for a typing package is `types-<scope>__<package name>`
    (two underscores as separator).
    Thus, it is similar to typings at [DefinitelyTyped][]. The folder name,
    in contrast to the role above, is just `<scope>__<package name>`

* **Package Scopes:**

  * For public packages, the scope `@coremedia` must be used.

    This allows using common repository mappings within `.npmrc` and others.

  * For _Private Packages_, the scope `@coremedia-internal` must be used.

* **Private Packages:**

  * Private or _internal_ packages are only meant for use within this
    repository.

  * Private packages must only be used as developer dependencies.

  * Private package always have a fixed version `1.0.0` which does not update on
    release.

## TSDoc

* **Use Markdown:** Documentation must be written using Markdown.

<!--
--------------------------------------------------------------------------------
References
--------------------------------------------------------------------------------
-->

[DefinitelyTyped]:
  <https://github.com/DefinitelyTyped/DefinitelyTyped>
  "DefinitelyTyped/DefinitelyTyped: The repository for high quality TypeScript type definitions."
