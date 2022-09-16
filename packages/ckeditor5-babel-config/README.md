# Shared Babel Configuration

This internal module contains some configuration for Babel shared across
all packages.

## Usage

```text
pnpm add --save-dev @coremedia-internal/ckeditor5-babel-config
```

Provide a `babel.config.js` with basic template:

```javascript
const sharedBabelConf = require('@coremedia-internal/ckeditor5-babel-config');

module.exports = sharedBabelConf;
```
