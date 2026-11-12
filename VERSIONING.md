# Versioning Policy

Each release of CKEditor 5 Plugins, integrated into CoreMedia Content Cloud
(CMCC) denotes its compatibility as _Compatibility Matrix_, similar to this:

| Artifact          | Version   |
|-------------------|-----------|
| CKEditor 5 (peer) | 35.2.0    |
| CMCC (used by)    | 11.2210.1 |

The following applies in principle:

* **CKEditor 5 Plugins Maintenance Releases:**

  A given CMCC version (here 2210) is always bound to a specific
  major version of CKEditor 5 plugins (not necessarily the other way round).
  As long as the given CMCC version ships maintenance releases, for any possibly
  required adjustment, a minor version update (or less) will be published.

  Maintenance releases will not include CKEditor 5 updates. Exception below.

* **CKEditor 5 Plugins Security Releases:**

  For any security issue within the plugin workspace, the same applies as
  for the maintenance releases mentioned above.

  Different to this, if any third-party dependency and here especially
  CKEditor 5 requires a security update to the most recent version, an exception
  applies to the rule above: In this case, a minor version update will be
  published along with the new version of the third-party dependency.

**Short:** If your CMCC version is bound to version `MAJOR.MINOR.PATCH` and
the given CMCC version is under maintenance, you may expect corresponding
minor or patch releases of CKEditor 5 Plugins without major breaking changes.
Exception to this are only security updates of third-party dependencies,
especially CKEditor 5: In this case, a minor release of CKEditor 5 Plugins
will be published, which may contain implicitly triggered breaking changes.

## Decision Matrix

> This matrix is based on the Versioning Policy provided for
> CKEditor 5 (see [latest][cke5:versioning-policy:latest] version).

CKEditor 5 Plugins for CMCC consists of multiple npm packages. When
releasing them, we use the following rules:

* We use the `MAJOR.MINOR.PATCH` version identifiers related to semantic
  versioning.

* All packages are always in the same version (different to semantic versioning,
  i.e., specific package updates may contain no changes).

* A major release of CKEditor 5 Plugins is published when at least one of its
  packages must have a major release.

* A minor release of CKEditor 5 Plugins is published when at least one of its
  packages must have a minor release and none of them require a major release.

* A package must have a major release when it contains a _major breaking change_.

* If none of the packages contain any breaking change, the following rules
  are used to determine the new version of each package:

  * If a package contains a minor breaking change, a `MINOR` version is
    increased.

  * If a package contains a new feature, a `MINOR` version is increased.

  * If a package contains only bug fixes, unrelated changes (e.g., updated
    translations), documentation or other internal changes, a `PATCH`
    version is increased.

## Major and Minor Breaking Changes

[[Top][]]

* **CKEditor 5 Dependency:** While loosely coupled to CKEditor 5 by using peer
  dependencies, each release is only tested with one specific version. As such
  we inherit the
  [versioning policy by CKEditor 5][cke5:versioning-policy:latest]. This
  results in the following relationship:
    
  * If CKEditor 5 plugins update to a new major of CKEditor 5, it is
    considered a **major breaking change** for CKEditor 5 plugins.

    Exception to this: If CKEditor 5 contains security fixes, the corresponding
    update of CKEditor 5 plugins is considered a **minor breaking change**,
    even if this may trigger migration efforts.

  * If CKEditor 5 plugins update to a new minor of CKEditor 5, it is
    considered an **at least a minor breaking change** for CKEditor 5
    plugins. Most likely, it is considered a major breaking change, though,
    as history tells, that minor CKEditor 5 updates, may still require
    efforts on upgrade.

  * If CKEditor 5 plugins update to a new patch version of CKEditor 5, at
    least the patch version of CKEditor 5 plugins is increased.

* **CoreMedia Services Dependency:** While loosely coupled to CoreMedia
  Services API via peer dependencies, each release is only tested with
  one specific version.

  Similar to the _CKEditor 5 Dependency_, we inherit the versioning
  policy of _CoreMedia Services API_.

  * If CKEditor 5 plugins update to a new major of CoreMedia Services,
    it is considered a **major breaking change** for CKEditor 5
    plugins.

  * If CKEditor 5 plugins update to a new minor of CoreMedia Services,
    it is considered an **at least a minor breaking change** for
    CKEditor 5 plugins.

  * If CKEditor 5 plugins update to a new patch version of CoreMedia
    Services, at least the patch version of CKEditor 5 plugins is
    increased.

* **Plugin API Changes:** Most of the API, which plugins expose, is not meant as 
  API to be used outside this repository. Exception to this is API, which is
  meant for configuration, like utility methods to configure data processing.

  * Breaking changes frequency: _rarely_.

    For any API, which is meant to be used outside this repository, we try to
    limit breaking changes. If breaking changes are required (to fix bugs or
    to decrease technical debt, for example), we will try to release them
    in a "batch". If possible, to-be-removed API will first be deprecated
    in one release, and removed in one of the next releases.

  * A breaking change in Plugin API is understood as a
    **major breaking change**. It is a **minor breaking change**, when
    the affected API is not meant to be used outside this repository.

* **Configuration API Changes:** This refers to configuration handed over when
    creating your CKEditor instance (`ClassicEditor`, for example).

  * Breaking changes frequency: _rarely_.

    Just as for Plugin API changes, we try to limit any breaking
    changes. Nevertheless, new features may require additional or even
    changes regarding the configuration. Just as for Plugin API, we
    try at best effort providing backwards compatible configurations.

    * A breaking change in Configuration API is understood as a
        **major breaking change**.

* **Build and Tooling:**

  * Node.js updates are considered a major breaking change. We will try to stick
    to LTS versions.

<!-- ======================================================[ REFERENCES ]=== -->

[Top]: <#top>

[cke5:versioning-policy:latest]: <https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html> "Versioning policy - CKEditor 5 Documentation (Latest)"
