# Development

## Prerequisites

* Install `pnpm` globally:

  ```text
  npm install --global pnpm
  ```

  The pnpm version used by this workspace is pinned via `packageManager` in
  the root `package.json`; pnpm switches to it automatically.

## Typical Build Process

```text
pnpm install
pnpm -r build
```

## Testing

Since Version 44 a license key is necessary to use the CkEditor.
Create a file named `.env` in the root of this workspace and add a line

```text
CKEDITOR_LICENSE_KEY=<your-license-key>
```

## Changesets

Every pull request needs a changeset, which states the kind of release the change
requires (see [Versioning](./VERSIONING.md)) and becomes its changelog entry:

```text
pnpm changeset
```

If a change needs no release (e.g. CI or documentation only), add an empty one:

```text
pnpm changeset add --empty
```

All published packages share one version: a changeset for one package bumps all of
them.

## Maintenance Branches

`main` holds the newest major. To ship fixes for an older major (see
[Versioning](./VERSIONING.md)), create a maintenance branch `maintenance/<major>`
with the GitHub Actions workflow _Create Maintenance Branch_ (input: the major,
e.g. `30`). It creates the branch from the newest release of that major.

A maintenance branch is a release line of its own and works like `main`: pull
requests need a changeset, are integrated by the QA gate, and are released via a
"Version Packages" pull request. Differences:

* Only `patch` and `minor` changesets are allowed; `major` changesets are rejected.
* Releases are published with the npm dist-tag `maintenance-<major>`, so `latest`
  keeps pointing to the newest release from `main`. Their GitHub release is not
  marked as latest.
* The API documentation on GitHub Pages is only deployed from `main`.

A fix needed on both lines is made on one branch and cherry-picked to the other,
including its changeset. `main` and maintenance branches are never merged into each
other.

**Example:**

1. `main` is released up to `30.4.2`; a CMCC version is bound to major 30.
2. `main` moves on with breaking changes and releases `31.0.0`, `31.1.0` and
   `32.0.0`.
3. A customer on that CMCC version needs a security fix, still on major 30.
4. _Create Maintenance Branch_ with `30` creates `maintenance/30` from `30.4.2`.
5. The fix is cherry-picked into `maintenance/30` with a `patch` changeset and
   released as `30.4.3` (dist-tag `maintenance-30`); `latest` stays on `32.x`.

The branch may also be created while `main` is still on that major, e.g. right
before breaking changes. `main` must then not release that major again: its
"Version Packages" pull request fails until a `major` changeset is pending.

Only releases made with Changesets can be used as starting point. Releases of the
old release process (up to `28.1.1`) and the legacy branches `maintenance/23.0`,
`24.0` and `25.0` are not supported by this workflow.

## Update Process

All dependency versions are maintained centrally in the `catalog` of
`pnpm-workspace.yaml`; the packages refer to them as `catalog:`, including their
`peerDependencies`. To update CKEditor 5, change the `ckeditor5` entry and the
`@ckeditor/*` entries there, then run:

```text
pnpm install
```

pnpm only installs versions released at least one day ago (`minimumReleaseAge`),
except for the scopes listed in `minimumReleaseAgeExclude`.

## Troubleshooting

* **Remove node_modules:**

  In case of problems, you may want to try to remove all `node_modules`
  folders and re-install artifacts again via `pnpm install`. Removing
  `node_modules` can be triggered by:

  ```text
  pnpm clean:node_modules
  ```
