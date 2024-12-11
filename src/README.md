## Methodology

1. One file, one purpose.
2. No imports, duplicate code.

## Directory structure

- ./bin  - core required subsystems (e.g. hacknet)
- ./boot - needed to boot the system
- ./etc  - config files
- ./lib  - shared libraries for ./bin/
- ./proc - process management (e.g. cpuinfo)
- ./sbin - system administration binaries (e.g. clean)
- ./tmp  - temporary files, deleted at any time
- ./usr  - optional subsystems (read-only)
- ./var  - optional subsystem logs (read-write)

## Versioning

[Semantic Versioning](http://semver.org/)

MAJOR.MINOR.PATCH-RELEASE

1. MAJOR version when you make incompatible API changes
2. MINOR version when you add functionality in a backwards-compatible manner
3. PATCH version when you make backwards-compatible bug fixes
4. RELEASE
    1. dev - in development
    2. alpha - private testing
    3. beta - public testing
    4. final - stable

### LICENSE and COPYRIGHT

Bitburner scripts are licensed under the [GNU GPLv3](http://www.gnu.org/licenses/gpl-3.0.html).