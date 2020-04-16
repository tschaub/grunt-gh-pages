# Change Log

## 4.0.0

Drop support for Node 6 (see [#88][#88])

## 3.1.0

Downgrade to `q-io@1.13.6` for a security fix (see [#73][#73])

## 3.0.0

Updated dependencies and stopped testing on Node 4 (see [#72][#72])

## 2.1.0

Upgrade to `q-io@2.0.6` based on npm audit.

## 2.0.0

Tests are no longer run on Node < 4.  The task may still work on older versions of Node, but since it is no longer tested there, use at your own risk.  Tests are currently run on Node 4 and Node 6.

There are no API breaking changes in this release, it only includes dependency updates.

* Replace `wrench` with `fs-extra` to avoid deprecation warning (see [#65][#65]).
* Upgrade to `q-io@2.0.2` to avoid overriding `Array.prototype.find` (thanks @jaridmargolin, see [#62][#62]).

## 1.2.0

* Upgrade to `graceful-fs@4` to get rid of warning (see [#66][#66])

[#62]: https://github.com/tschaub/grunt-gh-pages/pull/62
[#65]: https://github.com/tschaub/grunt-gh-pages/pull/65
[#66]: https://github.com/tschaub/grunt-gh-pages/pull/66
[#72]: https://github.com/tschaub/grunt-gh-pages/pull/72
[#73]: https://github.com/tschaub/grunt-gh-pages/pull/73
[#88]: https://github.com/tschaub/grunt-gh-pages/pull/88
