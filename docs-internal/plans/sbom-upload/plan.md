# Plan: Upload the Workspace SBOM to Dependency-Track (CKE-140)

Goal: upload a CycloneDX SBOM of the whole ckeditor-plugins workspace to
Dependency-Track, as component-foundation already does. Uploads cover `main`
and all future `maintenance/<major>` branches. The legacy branches
`maintenance/23.0`, `24.0`, `25.0` and the test branch `maintenance/28` are
out of scope.

This is a temporary solution: the [QA gate][qa-gate] generates the SBOM as an
artifact, and a nightly job on the team's Jenkins `venus-ci-01` uploads it.
It does not use the shared `reusable-sbom-upload.yml` of
`CoreMedia/github-actions`.

Mark each item as done (`[x]`) once it is complete and verified.

## Background

component-foundation generates the SBOM with `pnpm sbom` in its
[QA gate][cf-qa-gate] and uploads it through the shared reusable workflow on
`coremedia-selfhosted-runner-k8s`. ckeditor-plugins cannot do either part of
the upload from GitHub:

- ckeditor-plugins is **public**, and GitHub lets a public repository call only
  reusable workflows from public repositories. `CoreMedia/github-actions` is
  private.
- A self-hosted runner in a public repository is not safe: a pull request from
  a fork can change a workflow so it runs on that runner.
- Dependency-Track is **not reachable from GitHub-hosted runners**. Checked
  2026-11-18: its API server is not in public DNS and is only reachable from
  the internal network.

Jenkins runs inside the network and reaches both GitHub and Dependency-Track.
It already uploads SBOMs: `blueprint-sbom-upload.Jenkinsfile` in
`CoreMedia/cms` uses `dependencyTrackPublisher` with the credential
`dependency-track-prod`. GitHub cannot trigger the internal Jenkins, so the job
runs on a schedule.

The team has its own internal Jenkins instance, `venus-ci-01`. Its jobs are
Job DSL in the branch `venus-ci-01` of `CoreMedia/ci-jobs` (`ci/pipelines/`,
`ci/jenkinsfiles/`); see `ci/pipelines/perso_testsystem.groovy` there for a
nightly job. Nobody creates jobs in the Jenkins UI. The job **Seed** (defined
in `jenkins/seed-files/` of `CoreMedia/devops-tools`) creates them:

- It runs every evening at 21:00 (`0 21 * * *`) and can be started by hand.
- It checks out the `ci-jobs` branch named after the host (`venus-ci-01`, or the
  branch in its parameter `CI_JOBS_BRANCH`) and `ci-configuration` (`main`).
- It runs Job DSL over `ci/pipelines/*.groovy` and `ci/defaultPipelines.json`:
  new definitions create jobs, changed ones update them, and jobs whose
  definition is gone are **deleted** (`removedJobAction: 'DELETE'`).
- `readFileFromWorkspace` copies the Jenkinsfile into the job's configuration,
  so a Jenkinsfile change takes effect only after the next Seed run.
- Changes made in the Jenkins UI are overwritten by the next Seed run.

`pnpm sbom` works on this workspace: a local test produced CycloneDX 1.6 with
the root component `@coremedia/ckeditor5`, 925 components, 890 of them with
licenses.

## Decisions

- [x] **Mechanism:** the QA gate generates the SBOM before the push and stores
  it as an artifact. A nightly Jenkins job downloads the artifact of each
  branch head through the GitHub API, checks it, and uploads it.
- [x] **No Dependency-Track secrets in ckeditor-plugins:** only Jenkins talks to
  Dependency-Track.
- [x] **Job location:** Job DSL and Jenkinsfile both in the branch
  `venus-ci-01` of `CoreMedia/ci-jobs` (internal), next to the team's other
  jobs. The job runs on `venus-ci-01`.
- [x] **Schedule:** nightly.
- [x] **Artifact name:** `sbom-<commit SHA>`, where the SHA is the commit the
  QA gate pushes. Jenkins finds the artifact of a branch head by name, without
  mapping pull-request runs to pushed commits.
- [x] **Dependency-Track project:** `ckeditor-plugins-workspace`, below the
  parent project `Ckeditor Plugins` (parent version `-`).
- [x] **Project version:** `main` for `main`, `maintenance-<major>` for
  `maintenance/<major>` (e.g. `maintenance-30`).
- [x] **Project tags:**
  `workspace,team-venus,<version of the branch>,snapshot,internal,commit-<SHA>`.
  The version comes from `packages/ckeditor5-common/package.json`; all
  published packages share one version.
- [x] **Unchanged heads:** no skip (decided 2026-11-19). Jenkins uploads the
  artifact of each branch head every night; re-uploading the same SBOM is
  harmless.
- [x] **Upload mechanism:** the Jenkins plugin step `dependencyTrackPublisher`
  of the Dependency-Track plugin, as the Blueprint job does (decided
  2026-11-19, replacing an earlier decision for `curl`). The plugin takes the
  Dependency-Track URL and API key from its global configuration on
  `venus-ci-01`. The job still uses `curl` for the GitHub API.

## Open Questions

- [x] Check whether the parent project `Ckeditor Plugins` already exists in
  Dependency-Track. **Result (2026-11-19): it exists.**
- [x] Look up the version of the parent project `Ckeditor Plugins` (`-` or
  none), so `parentVersion` matches it. **Result (2026-11-19): `-`.**
- [x] Decide whether a fresh `maintenance/<major>` branch needs an SBOM before
  its first merged pull request (see D). **Decision (2026-11-19): no.** The
  Jenkins job logs a warning for the missing artifact.

## A. Prerequisites

- [x] Create the parent project `Ckeditor Plugins` in Dependency-Track if it
  doesn't exist. It already exists, so the Jenkins job doesn't need to create
  it.
- [x] Check your rights on `venus-ci-01`: log in, open `/whoAmI/` for your
  user and groups, and check that you may build the job **Seed** (**Build with
  Parameters**). Without that right, the job is still created by the 21:00
  Seed run, but you can't test a feature branch (see C).
- [ ] Check on `venus-ci-01` whether the Dependency-Track plugin is installed
  (**Manage Jenkins** > **Plugins** > **Installed plugins**) and configured
  globally (**Manage Jenkins** > **System** > **Dependency-Track**: API server
  URL and API key credential).
- [ ] Check on `venus-ci-01` under `/credentials/` whether these credentials
  exist:
  - [ ] a Dependency-Track API key as secret text (e.g.
    `dependency-track-prod`, which the Blueprint job uses on the cms Jenkins),
    selected in the plugin's global configuration;
  - [ ] a GitHub token (e.g. `github`) that can read the Actions artifacts of
    `CoreMedia/ckeditor-plugins`. The job uses `github` (username/password); it
    exists on `venus-ci-01`, since the team's AI test-system job already reads
    Actions artifacts with it.
- [ ] Request what is missing (plugin, its global configuration, credentials)
  by a ticket or email to support@coremedia.com, using the template in the
  `CoreMedia/ci-configuration` README for credentials (secret ID
  `venus-ci-01/<credential-id>`, or `jenkins-global/<credential-id>` if it
  already exists for other instances).
- [ ] Make sure the Dependency-Track API key has `BOM_UPLOAD`,
  `PROJECT_CREATION_UPLOAD`, `VIEW_PORTFOLIO` and `PORTFOLIO_MANAGEMENT`.
  After the upload, the plugin looks up the project (`VIEW_PORTFOLIO`) and sets
  its tags with a project update (`PORTFOLIO_MANAGEMENT`); without these, the
  upload step fails.

## B. Changes in ckeditor-plugins (Branch `venus/CKE-140-SBOM-upload`)

- [x] In the `integrate` job of the [QA gate][qa-gate], after the merge and
  before the push, take the commit to be pushed: `git rev-parse HEAD`.
- [x] After "Checks" and before the push, generate the SBOM. A failure blocks
  the merge.

  ```bash
  pnpm sbom \
    --sbom-format cyclonedx \
    --sbom-spec-version 1.6 \
    --sbom-type application \
    --out build/sbom/ckeditor-plugins-workspace.cdx.json
  ```

- [x] Write `build/sbom/metadata.json` with:
  - [x] `branch`: the base branch (`main` or `maintenance/<major>`);
  - [x] `commit`: the SHA from the first step;
  - [x] `version`: the version from `packages/ckeditor5-common/package.json`.
- [x] Upload `build/sbom` as the artifact `sbom-<SHA>` with
  `if-no-files-found: error` and `retention-days: 90` (the maximum for public
  repositories). `build/` is already git-ignored.
- [x] Document the SBOM artifact, the nightly Jenkins upload and where the job
  lives in [DEVELOPMENT.md][development], including that this is a temporary
  solution outside the shared workflow.
- [x] Add an empty changeset (`pnpm changeset add --empty`). The checks
  require a new changeset in every pull request, and changes to `.github/` and
  docs don't touch any package.
- [ ] Remove this plan before the branch is integrated.

## C. Jenkins Job in `CoreMedia/ci-jobs` (Branch `venus-ci-01`)

Implemented on the branch `ckeditor-plugins-sbom-upload` of `ci-jobs`, not
committed yet. Tested locally against GitHub: branch listing, missing artifact,
run and push checks (on a real QA-gate run), the checks of `metadata.json` and
the SBOM, and the dry run. Groovy syntax checked.

- [x] Add `ci/pipelines/ckeditor_plugins_sbom.groovy` with a folder (e.g.
  `CKEditor-Plugins`) and a `pipelineJob` (e.g. `nightly-sbom-upload`) with:
  - [x] a nightly trigger, e.g. `cron('H 2 * * *')`;
  - [x] the parameters `BRANCH` (default: all release branches) and `DRY_RUN`
    (only log what would be uploaded);
  - [x] the Jenkinsfile through
    `readFileFromWorkspace('ci/jenkinsfiles/ckeditorPluginsSbomUpload.Jenkinsfile')`
    with `sandbox()`, as the perso jobs do.
- [x] Add `ci/jenkinsfiles/ckeditorPluginsSbomUpload.Jenkinsfile`.
- [x] In the Jenkinsfile, list the branches of `CoreMedia/ckeditor-plugins`
  through the GitHub API and keep those matching
  `^(main|maintenance/[1-9][0-9]*)$`. This leaves out `maintenance/23.0`–`25.0`.
- [x] For each branch:
  - [x] read the head SHA;
  - [x] derive the project version (`main` or `maintenance-<major>`);
  - [x] look up the artifact with
    `GET /repos/CoreMedia/ckeditor-plugins/actions/artifacts?name=sbom-<SHA>`.
    If none exists or all expired, log a warning and continue with the next
    branch. A missing artifact is not a failure, e.g. for a fresh
    `maintenance/<major>` branch (see D);
  - [x] keep only artifacts whose run is `.github/workflows/qa-gate.yml` of
    `CoreMedia/ckeditor-plugins` and whose step "Push to base branch" (job
    "Integrate and Merge") succeeded. Don't require the whole job to succeed:
    "Deploy Storybook" runs after the push and may fail although the commit was
    pushed;
  - [x] if several artifacts remain (a retried QA gate after a fast-forward
    merge pushes the same SHA again), take the newest unexpired one;
  - [x] download and unzip the artifact;
  - [x] check that `metadata.json` names this branch and this SHA, and that the
    SBOM is CycloneDX 1.6 with the root component
    `pkg:npm/%40coremedia/ckeditor5@…`;
  - [x] upload it with `dependencyTrackPublisher`, as the Blueprint job does:
    - [x] `projectName: 'ckeditor-plugins-workspace'`
    - [x] `projectVersion`: `main` or `maintenance-<major>`
    - [x] `artifact`: `sbom/<project version>/ckeditor-plugins-workspace.cdx.json`
    - [x] `autoCreateProjects: true`, `synchronous: false`
    - [x] `projectProperties`: `parentName: 'Ckeditor Plugins'`,
      `parentVersion: '-'`, tags
      `workspace,team-venus,<version>,snapshot,internal,commit-<SHA>`
  - [x] count a failed upload (the plugin throws `AbortException`) as a failed
    branch and continue with the next one.
- [x] Fail the build if any branch failed, after all branches were processed,
  so one broken branch doesn't block the others. A missing artifact only logs a
  warning and doesn't count as failed.
- [x] Delete the workspace in `post { cleanup { deleteDir() } }`. Not
  `cmCleanup()`: it also stops and removes all Docker containers on the node.
- [x] A dry run doesn't call the plugin, so it works before the plugin and the
  Dependency-Track key are available on `venus-ci-01`.
- [ ] Test the job before the merge:
  - [ ] rebase the feature branch onto the current `venus-ci-01`, because Seed
    deletes every job that is missing from the branch it reads;
  - [ ] start Seed by hand with `CI_JOBS_BRANCH=<feature branch>`;
  - [ ] check that the job `CKEditor-Plugins/nightly-sbom-upload` exists on
    `venus-ci-01` and that the team's other jobs are unchanged;
  - [ ] run it with `DRY_RUN=true`;
  - [ ] expect the job to be deleted again by the next 21:00 Seed run, which
    reads `venus-ci-01`, until the pull request is merged.
- [ ] Open a pull request into `venus-ci-01` and get it reviewed by the team.
- [ ] After the merge, wait for the 21:00 Seed run or start Seed by hand without
  `CI_JOBS_BRANCH`, and check that the job exists. Its first nightly run
  follows at about 02:00.
- [ ] Check that the sandbox and the agent allow everything the Jenkinsfile
  needs (`curl`, `jq` and `unzip` on the agent; `tokenize`, `join` and the
  step `dependencyTrackPublisher` in the sandbox); request script approvals on
  `venus-ci-01` if not.

## D. Maintenance Branches

- [ ] Check that ckeditor-plugins needs no further change. The
  [Create Maintenance Branch][create-maintenance-branch] workflow cuts
  `maintenance/<major>` from a release tag, and the QA gate runs for
  `maintenance/*` too. The Jenkins job picks up new branches by name.
- [x] Accept the gap (decided 2026-11-19): the first commit of a new branch
  ("ci: Create maintenance/<major> from <tag>") is pushed by that workflow, not
  by the QA gate, so it has no artifact. No SBOM is generated for it; the
  Jenkins job logs a warning, and the branch gets its first upload after its
  first merged pull request. That's enough: the commit only changes
  `.changeset/config.json`, and every release from the branch goes through the
  QA gate first.
- [x] Note in [DEVELOPMENT.md][development]: a maintenance branch cut from a
  release made before this change (e.g. `maintenance/29` from `29.0.0`) needs
  this change cherry-picked to get SBOM artifacts.
- [ ] Remove the test branch `maintenance/28` before the job runs, or it gets
  uploaded once it has an artifact.

## E. Rollout and Verification

- [ ] Complete the prerequisites (A).
- [ ] Open the pull request from `venus/CKE-140-SBOM-upload` (B), get it
  reviewed and integrated.
- [ ] Check that the QA-gate run of that integration has the artifact
  `sbom-<SHA>` for the SHA now at the head of `main`.
- [ ] Merge the Jenkins job (C), let Seed create it on `venus-ci-01`, and run it
  once by hand with `DRY_RUN`.
- [ ] Run it without `DRY_RUN` and check that Dependency-Track shows
  `ckeditor-plugins-workspace` / `main` below `Ckeditor Plugins`, with about
  925 components and the expected tags.
- [ ] Run it again and check that `main` is uploaded again without errors and
  the tags follow the upload (see the permission in A).
- [ ] After the first merge to a new `maintenance/<major>` branch, check that
  the next nightly run creates `ckeditor-plugins-workspace` /
  `maintenance-<major>`.

## F. Follow-ups (Outside This Task)

- [ ] Add `ckeditor-plugins-workspace` to the cve-rating skill.
- [ ] Agree on how to remove `maintenance-<major>` versions from
  Dependency-Track when a branch is deleted (manual for now).

## Risks

- **Delay:** an upload arrives up to a day after the merge.
- **Expired artifacts:** a branch head older than 90 days has no artifact left.
  Dependency-Track keeps the last upload, and the job logs a warning for that
  branch every night until the next merge. A head that was never uploaded
  within 90 days stays missing until the next merge.
- **Trust in the artifact:** with the `pull_request` trigger, the PR's own
  version of the QA gate runs, so anyone with write access could produce a
  different SBOM. That's the same trust level as the push itself. The job's
  checks (run, push step, branch, SHA, root component) limit what it accepts.

[cf-qa-gate]:
  <https://github.com/CoreMedia/component-foundation/blob/main/.github/workflows/qa-gate.yml>
  "component-foundation QA gate"
[qa-gate]: <../../../.github/workflows/qa-gate.yml> "QA gate"
[create-maintenance-branch]:
  <../../../.github/workflows/create-maintenance-branch.yml>
  "Create Maintenance Branch"
[development]: <../../../DEVELOPMENT.md> "Development"
