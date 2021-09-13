### Feature Branches
There are two ways to build feature branches in the ci.
First one can create a pull request, and it will be built on each push.
Second a pre-release will be built, when a build is triggered manually.

#### Pull requests will be build
Whenever one creates a pull request or pushes to a branch where a pull request exists the
branch will be built without publishing any produced artifacts.

#### Release a pre-release from feature branch
Whenever one triggers a manual build on GitHub, a pre-release build starts. 
Building a pre-release means that packages are built and pushed to the npm-registry. 

The version of the produced packages are built with the pre-id `pr{prnumber}-{buildnumber}`.
This results in a version `MAJOR.MINOR.PATCH-pr{prnumber}-{buildnumber}`

### Releases
A release can be built by trigger a manual run on the main branch. Therefore,
a release-type (major, minor, patch) must be chosen, and a corresponding release will be built.
This means npm-packages are pushed to the npm-registry.

### Unpublish
Sometimes it happens that there are unwanted packages in the npm-registry (e.g. pre-releases from pull requests).
The unpublish workflow can be used to clean up and remove the unwanted packages.




