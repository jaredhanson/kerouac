# Contributing to `kerouac`

## Getting Started

To contribute to this package, you'll need a working development environment
with [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/).  Once these
tools are set up, you can start development by executing the following commands:

```sh
$ git clone https://github.com/jaredhanson/kerouac.git
$ cd kerouac
$ make test
```

A typical development workflow is as follows:

```sh
# ... hack hack hack ...
$ make test
$ git status                # review changes
$ git diff                  # review changes
$ git add --all
$ git commit                # commit changes
$ git push origin master
```

## Contributing

### Tests

The test suite is located in the `test/` directory.  All new features are
expected to have corresponding test cases with complete code coverage.  Patches
that increse test coverage are happily accepted.

Ensure that the test suite passes by executing:

```bash
$ make test
```

Coverage reports can be viewed by executing:

```bash
$ make test-cov
$ make view-cov
```
