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
