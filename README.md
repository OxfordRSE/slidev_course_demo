# Slidev build

First, install dependencies:
```bash
npm install
```

To preview / live edit a presentation:
```bash
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

You may need to set `NODE_OPTIONS='--no-webstorage'` during the build. This is because of an incompatability with Node >=25.

When the repository is updated, a Github action will use `./build_all.sh` to build all presentations into a `dist/` folder and deploy to github pages.
