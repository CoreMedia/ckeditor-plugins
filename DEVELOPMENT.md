# Development

## Prerequisites

* Install `pnpm` globally:

  ```text
  npm install --global pnpm
  ```

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

To run tests use:

```text
pnpm run jest
```

## Update Process

If updating CKEditor 5, it is best done in three steps:

```text
pnpm update:latest:third-party
pnpm update:latest:ckeditor5-dev
pnpm update:latest:ckeditor5
```

The first one will trigger an update of all other third-party packages.

The second one will trigger an update of the CKEditor 5 Development Tooling.

The third one will perform the update of the main CKEditor 5 packages.

**Peer Dependencies:** Note, that `pnpm update` will not update the
`peerDependencies`. This has to be done in a manual adjustment afterwards.

## Troubleshooting

* **Remove node_modules:**

  In case of problems, you may want to try to remove all `node_modules`
  folders and re-install artifacts again via `pnpm install`. Removing
  `node_modules` can be triggered by:

  ```text
  pnpm clean:node_modules
  ```
