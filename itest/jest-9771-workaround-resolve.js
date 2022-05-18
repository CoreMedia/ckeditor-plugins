// copied from https://www.npmjs.com/package/enhanced-resolve-jest
// see jest issue: https://github.com/facebook/jest/issues/9771
// jest does not understand exports in package.json yet
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tslib_1 = require("tslib");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs_1 = tslib_1.__importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const enhanced_resolve_1 = require("enhanced-resolve");
const EMPTY_FILE = require.resolve("./jest-9771-workaround-empty");
const cachedInputFileSystem = new enhanced_resolve_1.CachedInputFileSystem(fs_1.default, 60000);
let queuedPurge = false;
exports.default = module.exports = exports = create(getDefaultConfig);
function create(getConfig) {
  const resolverCache = Object.create(null);
  return function (modulePath, jestOpts) {
    if (!queuedPurge) {
      queuedPurge = true;
      setImmediate(function () {
        cachedInputFileSystem.purge();
        queuedPurge = false;
      });
    }
    const configOpts = {
      browser: jestOpts.browser,
      extensions: jestOpts.extensions,
      moduleDirectory: jestOpts.moduleDirectory,
    };
    const userConfig = getConfig(configOpts);
    const cacheKey = configOpts.browser + "\0" + jestOpts.extensions + "\0" + configOpts.moduleDirectory;
    const resolver =
      resolverCache[cacheKey] ||
      (resolverCache[cacheKey] = enhanced_resolve_1.ResolverFactory.createResolver(
        tslib_1.__assign({ fileSystem: cachedInputFileSystem }, userConfig, { useSyncFileSystemCalls: true })
      ));
    const resolved = resolver.resolveSync({}, jestOpts.basedir, modulePath);
    if (resolved === false) {
      return EMPTY_FILE;
    }
    return resolved;
  };
}
exports.create = create;
function getDefaultConfig(opts) {
  return tslib_1.__assign(
    { symlinks: true, extensions: opts.extensions, modules: opts.moduleDirectory, fileSystem: fs_1.default },
    opts.browser
      ? {
          aliasFields: ["browser"],
          mainFields: ["browser", "main"],
        }
      : {}
  );
}
exports.getDefaultConfig = getDefaultConfig;
//# sourceMappingURL=index.js.map
