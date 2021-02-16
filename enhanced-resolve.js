// copied from https://www.npmjs.com/package/enhanced-resolve-jest
// see jest issue: https://github.com/facebook/jest/issues/9771
// jest does not understand exports in package.json yet
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var enhanced_resolve_1 = require("enhanced-resolve");
var EMPTY_FILE = require.resolve("./empty");
var cachedInputFileSystem = new enhanced_resolve_1.CachedInputFileSystem(fs_1.default, 60000);
var queuedPurge = false;
exports.default = module.exports = exports = create(getDefaultConfig);
function create(getConfig) {
    var resolverCache = Object.create(null);
    return function (modulePath, jestOpts) {
        if (!queuedPurge) {
            queuedPurge = true;
            setImmediate(function () {
                cachedInputFileSystem.purge();
                queuedPurge = false;
            });
        }
        var configOpts = {
            browser: jestOpts.browser,
            extensions: jestOpts.extensions,
            moduleDirectory: jestOpts.moduleDirectory
        };
        var userConfig = getConfig(configOpts);
        var cacheKey = configOpts.browser + "\0" + jestOpts.extensions + "\0" + configOpts.moduleDirectory;
        var resolver = resolverCache[cacheKey] ||
            (resolverCache[cacheKey] = enhanced_resolve_1.ResolverFactory.createResolver(tslib_1.__assign({ fileSystem: cachedInputFileSystem }, userConfig, { useSyncFileSystemCalls: true })));
        var resolved = resolver.resolveSync({}, jestOpts.basedir, modulePath);
        if (resolved === false) {
            return EMPTY_FILE;
        }
        return resolved;
    };
}
exports.create = create;
function getDefaultConfig(opts) {
    return tslib_1.__assign({ symlinks: true, extensions: opts.extensions, modules: opts.moduleDirectory, fileSystem: fs_1.default }, (opts.browser
        ? {
            aliasFields: ["browser"],
            mainFields: ["browser", "main"]
        }
        : {}));
}
exports.getDefaultConfig = getDefaultConfig;
//# sourceMappingURL=index.js.map
