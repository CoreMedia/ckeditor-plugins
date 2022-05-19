# Releasing

Releases are triggered via _GitHub Actions_. You may run main releases
as well as pre-releases to validate, for example, a current state in other
contexts such as CoreMedia Studio.

## Main Release

**Action:** _Release_

Creates a release from either `main` or some `maintenance/*` branch.

Prior to running, you will be asked whether the release will be of type
_major_, _minor_ or _patch_. Depending on the selected type the version number
will be increased according to semantic versioning.

If you are unsure, which type to choose, consider reading notes
on [Versioning][].

### Release Preparation

Before performing a release, ensure, that the documentation got updated by
running:

```bash
pnpm run doc
```

and commit changes applied in `docs/` folder.

### Post-Actions after Release

After a release a tag like `4.0.0` got created. To get it listed in the releases
you need to create a release (if you have not drafted it yet). Just go to
_Releases_, select the recently created tag and make it a release. Suggested
steps:

* Prefix the name with `v` for consistence, such as `v4.0.0`.

* Let GitHub add recent PRs to the description to get a first start for
  _What's Changed_. Adapt description providing some more details.

* Minor Quirk: Change the default _Full Changelog_

  ```diff
  - **Full Changelog**: https://...
  + **Full Changelog:** https://...
  ```

## Pre-Release

**Action:** _Pre-Release_

A pre-release is automatically triggered on updates on `main`. It gets
a version number like `4.0.1-rc.2`.

To create a pre-release from feature branches, you may manually trigger
_Pre-Release_ action. The applied version is derived from the pull-request
number, followed by a build-number.

Pattern:

```text
MAJOR.MINOR.PATCH-pr{prnumber}-{buildnumber}
```

Example: `4.0.1-pr42-3`

## No Release on Pull Request Update

When updating a ready-for-review pull-request the CI is triggered, to validate
if it passes the automated quality assurance. This will not create a release,
though.

## Undo Release: Unpublish

Sometimes it happens that there are unwanted packages in the npm-registry
(e.g., pre-releases from pull requests). The Unpublish action can be used to
clean up and remove the unwanted packages.

<!--
--------------------------------------------------------------------------------
References
--------------------------------------------------------------------------------
-->

[Versioning]:
  <./VERSIONING.md>
