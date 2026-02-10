# Slidev build

First, install dependencies:

```shell
npm install
```

To preview / live edit a presentation:

```shell
npx slidev --open --entry presentations/functional/slides.md
```

If you encounter an error similar to this:

```text
var shouldDebug = hasLocalStorage && /*#__PURE__*/localStorage.getItem("DEBUG") || hasProcess && process.env.DEBUG;
                                                               ^

TypeError: localStorage.getItem is not a function
    at Object.<anonymous> (node_modules/@typescript/vfs/dist/vfs.cjs.development.js:25:64)
    at Module._compile (node:internal/modules/cjs/loader:1809:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1940:10)
    at Module.load (node:internal/modules/cjs/loader:1530:32)
    at Module._load (node:internal/modules/cjs/loader:1332:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)
    at Module.require (node:internal/modules/cjs/loader:1553:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (node_modules/@typescript/vfs/dist/index.js:7:20)
    at Module._compile (node:internal/modules/cjs/loader:1809:14)
```

You may need to set `NODE_OPTIONS='--no-webstorage'` during the build. This is
because of an incompatability with Node >=25.

## Build with a specific training event

You may set up a YAML fle for a training event that contains all the dates of
different sessions, and by using the theme `theme-oxrse` with the `orientation`
layout, it will include the 'Orientation' slide in the PowerPoint presentation
using the dates in the YAML file. The YAML file provides a single source of
truth for all the dates of a training event and highlight the current session.

For example, if you have a YAML file `common/events/hilary-2026.yaml` with the
following content:

```yaml
year: 2026
sessions:
  - date: "22 Jan"
    slot: morning
    topic: Object-Oriented Programming
  - date: "22 Jan"
    slot: afternoon
    topic: Functional Programming
  - date: "29 Jan"
    slot: morning
    topic: Version control with Git
  - date: "29 Jan"
    slot: afternoon
    topic: Collaboration with GitHub
  - date: "05 Feb"
    slot: morning
    topic: Software Testing
  - date: "05 Feb"
    slot: afternoon
    topic: Continuous Integration
  - date: "12 Feb"
    slot: morning
    topic: Packaging and Dependency Management
  - date: "12 Feb"
    slot: afternoon
    topic: Containerisation with Docker
  - date: "19 Feb"
    slot: morning
    topic: Introduction to HPC
  - date: "19 Feb"
    slot: afternoon
    topic: Workflows with Snakemake
```

You can build with:

```shell
TRAINING_EVENT='hilary-2026' npx slidev --open --entry presentations/functional/slides.md
```

Note: this is an initial implementation and there is no rigorous error checking
at the moment, e.g. you can put anything in the 'date' field.

# Deployment

When the repository is updated, a Github action will use `./build_all.sh` to build all presentations into a `dist/` folder and deploy to github pages.

