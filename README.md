# Slidev build

First, install dependencies:
```bash
npm install
```

To preview / live edit a presentation:
```bash
npx slidev --open --entry presentations/functional/slides.md
```

When the repository is updated, a Github action will use `./build_all.sh` to build all presentations into a `dist/` folder and deploy to github pages.
