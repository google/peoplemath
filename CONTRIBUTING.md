# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Continuous build

Pull requests will not be accepted if they cause the continuous build to fail
(see [README.md](README.md#continuous-build)).

Here is a list of checks run, and ways to make sure they pass while developing:

- Go backend tests must pass (run `go test ./...` from the `backend` directory)
- Angular tests must pass (keep `ng test` running in the background)
- Angular lint checks must pass (run `ng lint` - adding `--fix` will
  automatically fix many problems for you)
- Non-Go files must be formatted according to [Prettier](https://prettier.io).
  Either run `npx prettier --write .` from the root of the repo or [set up
  editor integration](https://prettier.io/docs/en/editors.html).
- Go code must be formatted according to [the `gofmt`
  command](https://golang.org/cmd/gofmt/) (many editors can be configured to do
  this automatically on save - for example [see
  here](https://code.visualstudio.com/docs/languages/go#_formatting) for Visual
  Studio Code)
- Any new source files added must have a "Copyright Google LLC" notice in the
  headers. (This does not affect contributors' rights; [see
  here](https://opensource.google/docs/releasing/contributions/#copyright) for
  more information.) These can be added automatically using [the `addlicense`
  tool](https://github.com/google/addlicense) - no arguments are required other
  than the names of the new source files.

See the [Dockerfile](Dockerfile) in the root of the project for an authoritative
up-to-date list of checks performed.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Community Guidelines

This project follows [Google's Open Source Community
Guidelines](https://opensource.google.com/conduct/).
