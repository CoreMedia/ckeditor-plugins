Versioning Policy
================================================================================

> This Versioning Policy is based on the Versioning Policy provided for
> CKEditor 5 (see [reference][cke5:versioning-policy:reference] or
> [latest][cke5:versioning-policy:latest] version).

CKEditor 5 Plugins for CoreMedia CMS consists of multiple npm packages. When
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

* If none of the packages contain any major breaking change, the following rules
    are used to determine the new version of each package:

    * If a package contains a minor breaking change, a `MINOR` version is
        increased.

    * If a package contains a new feature, a `MINOR` version is increased.

    * If a package contains only bug fixes, unrelated changes (e.g., updated
        translations), documentation or other internal changes, a `PATCH`
        version is increased.

Major and Minor Breaking Changes
--------------------------------------------------------------------------------

[[Top][]]

* **CKEditor 5 Dependency:** While loosely coupled to CKEditor 5 by using peer
    dependencies, each release is only tested with one specific version. As such
    we inherit the
    [versioning policy by CKEditor 5][cke5:versioning-policy:reference]. This
    results in the following relationship:
    
    * If CKEditor 5 plugins update to a new major of CKEditor 5, it is
        considered a **major breaking change** for CKEditor 5 plugins.

    * If CKEditor 5 plugins update to a new minor of CKEditor 5, it is
        considered an **at least a minor breaking change** for CKEditor 5
        plugins.

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

* **Plugin API Changes:** While CKEditor 5 plugins provide mostly independent
    extensions to the CKEditor 5 ecosystem, they also provide some extension
    points, which may be used by other plugin developers.

    * Breaking changes frequency: _rarely_.

        Expecting, that the API may be used by developers, we try to limit
        breaking changes. If breaking changes are required (to fix bugs or
        to decrease technical debt, for example), we will try to release them
        in a "batch". If possible, to-be-removed API will first be deprecated
        in one release, and removed in one of the next releases.

    * A breaking change in Plugin API is understood as a
        **major breaking change**.

* **Customization API Changes:** This refers to configuration handed over when
    creating your CKEditor instance (`ClassicEditor`, for example).

    * Breaking changes frequency: _rarely_ to _moderate_.

        Just as for Plugin API changes, we try to limit any breaking
        changes. Nevertheless, new features may require additional or even
        changes regarding the configuration. Just as for Plugin API, we
        try at best effort providing backwards compatible configurations.

    * A breaking change in Customization API is understood as a
        **minor breaking change**.
* **Build and toooling:**
  * NodeJS Updates are considered a major breaking change. We will try to stick to
    LTS versions.
<!-- ======================================================[ REFERENCES ]=== -->

[Top]: <#top>

<!-- Versioning Policies for CKEditor 5 -->

[cke5:versioning-policy:latest]: <https://ckeditor.com/docs/ckeditor5/latest/framework/guides/support/versioning-policy.html> "Versioning policy - CKEditor 5 Documentation (Latest)"
<!--
  The reference version refers to the version, we adapted this policy to. As it
  may be different to the latest policy, we explicitly refer to this kind of
  _permlink_ (which is to replace "latest" by a specific version number).
-->
[cke5:versioning-policy:reference]: <https://ckeditor.com/docs/ckeditor5/29.2.0/framework/guides/support/versioning-policy.html> "Versioning policy - CKEditor 5 Documentation (29.2.0)"
