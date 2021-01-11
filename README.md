# CKEditor 5 Evaluation and Preparation

This repository contains the results of our preparation steps for
replacing CKEditor 4 which reaches EOL soon. While `archive/` contains
previous evaluation efforts, the root-folder represents the current
evaluation process.

## Command Line Reference

### Install Dependencies

```
yarn bootstrap
```

### Update Dependencies

```
yarn upgrade
```

### Build Artifacts

```
yarn build
```

You will find an editor, which is ready to test in [app/sample](app/sample/index.html).

### Run Tests

```
yarn test
```

Per definition, this only runs unit tests based on JEST.

```
yarn test:integration
```

This is a sketch, how we may ues CKEditor tooling for integration tests with
CKEditor. These tests require to start a browser.

To run tests with headless Chrome use:

```
yarn test:integration --browsers=ChromeHeadless
```

To generate a coverage report:

```
yarn test:integration --coverage
```

```
yarn test:manual
```

This will run one example of a manual test, as CKEditor does it. If we want
to continue with this, we would have to find a way to style the editor
appropriately (i.e., to apply the lark theme).

Current suggestion is, to skip integration and guided manual tests and instead
completely rely on manual tests for each release, based in the example application.

### Add Dependency

```text
yarn add the-dependency
```

### Add Development Dependency

```text
yarn add the-development-dependency --dev
```

### Upgrade All Dependencies

To update all dependencies in `package.json` to their latest version:

```text
yarn global add npm-check-updates
yarn npm-check-updates
yarn install
```

## CKEditor Research

### Logging

* CKEditor does not provide any logging facade itself. It uses the Console log
    directly, e.g., via `console.error()` or `console.log()`.
* For CKEditor 4 plugins in CoreMedia Workspace we used a custom class
    `CKEDITOR.coremedia.Logger` to provide logging abilities. This used
    the Console log in the end as well, but provided some abstraction and
    better control, if certain types of logging are enabled or not.

## Related JIRA Issues

* [\[CMS-18463\] \[CKEditor 5\] Warm laufen](https://jira.coremedia.com/browse/CMS-18463)
* [\[CMS-13587\] Evaluate the future of Studio-RichText-Editing: CKEditor 5 or what?](https://jira.coremedia.com/browse/CMS-13587)

## Testing Research

### Links

* [Jest · 🃏 Delightful JavaScript Testing](https://jestjs.io/)
    * [Getting Started · Jest](https://jestjs.io/docs/en/getting-started.html)
* [kulshekhar/ts-jest: TypeScript preprocessor with sourcemap support for Jest](https://github.com/kulshekhar/ts-jest)
    * [mtiller/ts-jest-sample: A sample repo leveraging TypeScript, jest and ts-jest (with code coverage and debugging)](https://github.com/mtiller/ts-jest-sample)
* [ckeditor5-dev/packages/ckeditor5-dev-tests at master · ckeditor/ckeditor5-dev](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-tests)
* [ckeditor5-dev/README.md at master · ckeditor/ckeditor5-dev](https://github.com/ckeditor/ckeditor5-dev/blob/master/packages/ckeditor5-dev-tests/bin/intellijkarmarunner/README.md)
* Karma: [Automated testing with Headless Chrome  |  Web  |  Google Developers](https://developers.google.com/web/updates/2017/06/headless-karma-mocha-chai)

## See Also

### CoreMedia Know How

* [CoreMedia/coremedia-headless-client-react-pwa](https://github.com/CoreMedia/coremedia-headless-client-react-pwa)

### CKEditor

* [ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5)

#### CKEditor Documentation

* [Development tools](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/development-tools.html)
* [Creating a simple plugin](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/creating-simple-plugin.html)
* [Installing plugins](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installing-plugins.html)

#### CKEditor Issues

* [Typings for TypeScript · Issue #504 · ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5/issues/504)

#### CKEditor TypeScript

* Example: [DMITRYTISHKIN/ckeditor-plugin](https://github.com/DMITRYTISHKIN/ckeditor-plugin)
* Example (Full CKEditor): [matepapp/nextjs-aws-amplify: Proof of concept combining the serverless powers of NextJS and AWS Amplify](https://github.com/matepapp/nextjs-aws-amplify)

### TypeScript

* [TypeScript: How to set up TypeScript](https://www.typescriptlang.org/download)
* [DefinitelyTyped/DefinitelyTyped: The repository for high quality TypeScript type definitions.](https://github.com/DefinitelyTyped/DefinitelyTyped)
* [Using a JavaScript library (without type declarations) in a TypeScript project. | by Steve Ruiz | Medium](https://medium.com/@steveruiz/using-a-javascript-library-without-type-declarations-in-a-typescript-project-3643490015f3)
* [TypeScript: TSConfig Reference - Docs on every TSConfig option](https://www.typescriptlang.org/tsconfig)
* [Smarter way to organize “import” statements using “index.ts” file(s) in Angular | by Balram Chavan | Medium](https://medium.com/@balramchavan/smarter-way-to-organize-import-statements-using-index-ts-file-s-in-angular-c685e9d645b7)

### Yarn

* [Getting Started | Yarn](https://classic.yarnpkg.com/en/docs/getting-started/)
* [The Yarn Workflow | Yarn](https://classic.yarnpkg.com/en/docs/yarn-workflow)
* [Workspaces in Yarn | Yarn Blog](https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/)
