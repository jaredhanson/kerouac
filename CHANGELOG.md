# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- `app#generate` invokes callback after all pages have been generated.

### Changed
- Routes added to the main app are automatically mapped when `app#generate` is
called.

## [0.4.0] - 2024-03-18

### Added
- Added `page#convert()` for writing a page after converting from lightweight
markup.

### Changed
- `page#compile` takes required `layout` as first argument, rather than third.
- `page#compile` now invokes callback after rendering.  If content is needed
without being inserted into a layout, call `page#convert`.

### Removed
- Removed `options` argument to `app#markup()`.  If default options are needed,
they can be bound via closure instead.

### Fixed
- Options passed to `page#compile` are passed to `app#convert`.
- Options passed to `page#compile` are passed to `page#render`.

## [0.3.0] - 2024-03-11

### Changed

- Auto-`require()`'ing of engines expect the module to export a `.__express`
function, rather than `.renderFile`, for compatibility with existing engines and
Express conventions.
- Renamed `app#convert()` to `app#markup()`.
- `app#convert` is now a synchronous function, returning a string rather than
yielding an error and string to a callback function.

### Removed

- Removed ability to pass module object containing `renderFile` and `render`
functions as argument to `app#engine()`.  Plugins that render lightweight markup
should now be registered via `app#markup()`.
- Removed "identity" engine used to render static, non-templated HTML files.
- Removed support for JSON as a front matter format.  If support is needed, it
can be added by applications using `app#fm()`.

## [0.2.0] - 2023-12-12

## [0.1.3] - 2018-09-23

## [0.1.2] - 2018-09-21
### Changed
- Added `manifest()` to middleware used implicitly by application.

## [0.1.1] - 2018-09-17

## [0.1.0] - 2017-10-10

## [0.0.3] - 2013-05-01

## [0.0.2] - 2013-02-26

## [0.0.1] - 2012-11-10

- Initial release.

[Unreleased]: https://github.com/jaredhanson/kerouac/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/jaredhanson/kerouac/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jaredhanson/kerouac/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/jaredhanson/kerouac/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/jaredhanson/kerouac/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/jaredhanson/kerouac/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jaredhanson/kerouac/compare/v0.0.3...v0.1.0
[0.0.3]: https://github.com/jaredhanson/kerouac/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/jaredhanson/kerouac/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/jaredhanson/kerouac/releases/tag/v0.0.1
