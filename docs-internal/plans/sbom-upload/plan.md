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
  2026-11-18: `apiserver.dependency-track.coremedia.io` doesn't exist in public
  DNS (NXDOMAIN at Cloudflare and Google). On the corporate network it resolves
  to `10.100.4.217` and `10.100.7.125` (private Route 53 zone, load balancer
  `moebius-internal-services`, see `aws/prod/README.md` in
  `CoreMedia/dependency-track-infra`).

Jenkins runs inside the network and reaches both GitHub and Dependency-Track.
It already uploads SBOMs: `blueprint-sbom-upload.Jenkinsfile` in
`CoreMedia/cms` uses `dependencyTrackPublisher` with the credential
`dependency-track-prod`. GitHub cannot trigger the internal Jenkins, so the job
runs on a schedule.

The team's Jenkins is `https://jenkins.venus-ci-01.coremedia.vm`. Its jobs are
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
- [x] **Unchanged heads:** Jenkins skips a branch whose Dependency-Track project
  already has the tag `commit-<SHA>` of the current head.

## Open Questions

- [ ] Check whether the parent project `Ckeditor Plugins` already exists in
  Dependency-Track, and look up how `Component Foundation` stores its version
  (`-` or none), so the parent version matches.
- [ ] Decide whether a fresh `maintenance/<major>` branch needs an SBOM before
  its first merged pull request (see D).

## A. Prerequisites

- [ ] Create the parent project `Ckeditor Plugins` in Dependency-Track if it
  doesn't exist, or let the Jenkins job create it as the Blueprint job does
  (lookup, then `PUT /api/v1/project`).
- [ ] Check your rights on `venus-ci-01`: log in, open `/whoAmI/` for your
  user and groups, and check that you may build the job **Seed** (**Build with
  Parameters**). Without that right, the job is still created by the 21:00
  Seed run, but you can't test a feature branch (see C).
- [ ] Check on `venus-ci-01` under `/credentials/` whether these credentials
  exist:
  - [ ] a Dependency-Track API key (e.g. `dependency-track-prod`, which the
    Blueprint job uses on the cms Jenkins);
  - [ ] a GitHub token (e.g. `github`) that can read the Actions artifacts of
    `CoreMedia/ckeditor-plugins`.
- [ ] Request missing credentials by email to support@coremedia.com, using the
  template in the `CoreMedia/ci-configuration` README (secret ID
  `venus-ci-01/<credential-id>`, or `jenkins-global/<credential-id>` if it
  already exists for other instances).
- [ ] Make sure the Dependency-Track API key has `BOM_UPLOAD`,
  `PROJECT_CREATION_UPLOAD` and `VIEW_PORTFOLIO` (for the tag lookup).

## B. Changes in ckeditor-plugins (Branch `venus/CKE-140-SBOM-upload`)

- [ ] In the `integrate` job of the [QA gate][qa-gate], after the merge and
  before the push, take the commit to be pushed: `git rev-parse HEAD`.
- [ ] After "Checks" and before the push, generate the SBOM. A failure blocks
  the merge.

  ```bash
  pnpm sbom \
    --sbom-format cyclonedx \
    --sbom-spec-version 1.6 \
    --sbom-type application \
    --out build/sbom/ckeditor-plugins-workspace.cdx.json
  ```

- [ ] Write `build/sbom/metadata.json` with:
  - [ ] `branch`: the base branch (`main` or `maintenance/<major>`);
  - [ ] `commit`: the SHA from the first step;
  - [ ] `version`: the version from `packages/ckeditor5-common/package.json`.
- [ ] Upload `build/sbom` as the artifact `sbom-<SHA>` with
  `if-no-files-found: error` and `retention-days: 90` (the maximum for public
  repositories). `build/` is already git-ignored.
- [ ] Document the SBOM artifact, the nightly Jenkins upload and where the job
  lives in [DEVELOPMENT.md][development], including that this is a temporary
  solution outside the shared workflow.
- [ ] Add an empty changeset (`pnpm changeset add --empty`). The checks
  require a new changeset in every pull request, and changes to `.github/` and
  docs don't touch any package.
- [ ] Remove this plan before the branch is integrated.

## C. Jenkins Job in `CoreMedia/ci-jobs` (Branch `venus-ci-01`)

- [ ] Add `ci/pipelines/ckeditor_plugins_sbom.groovy` with a folder (e.g.
  `CKEditor-Plugins`) and a `pipelineJob` (e.g. `nightly-sbom-upload`) with:
  - [ ] a nightly trigger, e.g. `cron('H 2 * * *')`;
  - [ ] the parameters `BRANCH` (default: all release branches) and `DRY_RUN`
    (only log what would be uploaded);
  - [ ] the Jenkinsfile through
    `readFileFromWorkspace('ci/jenkinsfiles/ckeditorPluginsSbomUpload.Jenkinsfile')`
    with `sandbox()`, as the perso jobs do.
- [ ] Add `ci/jenkinsfiles/ckeditorPluginsSbomUpload.Jenkinsfile`.
- [ ] In the Jenkinsfile, list the branches of `CoreMedia/ckeditor-plugins`
  through the GitHub API and keep those matching
  `^(main|maintenance/[1-9][0-9]*)$`. This leaves out `maintenance/23.0`–`25.0`.
- [ ] For each branch:
  - [ ] read the head SHA;
  - [ ] derive the project version (`main` or `maintenance-<major>`);
  - [ ] skip the branch if the Dependency-Track project already has the tag
    `commit-<SHA>`;
  - [ ] look up the artifact with
    `GET /repos/CoreMedia/ckeditor-plugins/actions/artifacts?name=sbom-<SHA>`.
    If none exists or all expired, log a warning and continue with the next
    branch;
  - [ ] keep only artifacts whose run is `.github/workflows/qa-gate.yml` of
    `CoreMedia/ckeditor-plugins` and whose step "Push to base branch" (job
    "Integrate and Merge") succeeded. Don't require the whole job to succeed:
    "Deploy Storybook" runs after the push and may fail although the commit was
    pushed;
  - [ ] if several artifacts remain (a retried QA gate after a fast-forward
    merge pushes the same SHA again), take the newest unexpired one;
  - [ ] download and unzip the artifact;
  - [ ] check that `metadata.json` names this branch and this SHA, and that the
    SBOM is CycloneDX 1.6 with the root component
    `pkg:npm/%40coremedia/ckeditor5@…`;
  - [ ] upload it with `dependencyTrackPublisher`, as the Blueprint job does:
    - [ ] `projectName: 'ckeditor-plugins-workspace'`
    - [ ] `projectVersion`: `main` or `maintenance-<major>`
    - [ ] `artifact`: `ckeditor-plugins-workspace.cdx.json`
    - [ ] `autoCreateProjects: true`
    - [ ] `projectProperties`: `parentName: 'Ckeditor Plugins'`,
      `parentVersion: '-'`, tags
      `workspace,team-venus,<version>,snapshot,internal,commit-<SHA>`
- [ ] Fail the build if any branch failed, after all branches were processed,
  so one broken branch doesn't block the others.
- [ ] Clean up the workspace in `post { always { cmCleanup() } }`.
- [ ] Test the job before the merge:
  - [ ] rebase the feature branch onto the current `venus-ci-01`, because Seed
    deletes every job that is missing from the branch it reads;
  - [ ] start Seed by hand with `CI_JOBS_BRANCH=<feature branch>`;
  - [ ] check that the job exists at
    `https://jenkins.venus-ci-01.coremedia.vm/job/CKEditor-Plugins/job/nightly-sbom-upload/`
    and that the team's other jobs are unchanged;
  - [ ] run it with `DRY_RUN=true`;
  - [ ] expect the job to be deleted again by the next 21:00 Seed run, which
    reads `venus-ci-01`, until the pull request is merged.
- [ ] Open a pull request into `venus-ci-01` and get it reviewed by the team.
- [ ] After the merge, wait for the 21:00 Seed run or start Seed by hand without
  `CI_JOBS_BRANCH`, and check that the job exists. Its first nightly run
  follows at about 02:00.
- [ ] Check that the sandbox allows everything the Jenkinsfile needs (e.g.
  JSON parsing, `dependencyTrackPublisher`); request script approvals on
  `venus-ci-01` if not.

## D. Maintenance Branches

- [ ] Check that ckeditor-plugins needs no further change. The
  [Create Maintenance Branch][create-maintenance-branch] workflow cuts
  `maintenance/<major>` from a release tag, and the QA gate runs for
  `maintenance/*` too. The Jenkins job picks up new branches by name.
- [ ] Accept or close the gap: the first commit of a new branch
  ("ci: Create maintenance/<major> from <tag>") is pushed by that workflow, not
  by the QA gate, so it has no artifact. The branch gets its first upload after
  its first merged pull request. Option: also generate the artifact in
  `create-maintenance-branch.yml`.
- [ ] Note in [DEVELOPMENT.md][development]: a maintenance branch cut from a
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
- [ ] Run it again and check that `main` is skipped as unchanged.
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
  That's harmless once it was uploaded (the job skips it by the commit tag),
  but a head that was never uploaded within 90 days stays missing until the
  next merge.
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
