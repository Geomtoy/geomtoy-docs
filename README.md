# Geomtoy docs

This repo is the docs of Geomtoy.

## Development setup

1. Run `npm ci` to install all the `devDependencies` of this repo.
2. Run `git submodule update --init` to download Geomtoy as a submodule of this repo.
3. Run `node create-link` to create symlinks from Geomtoy packages to `node_modules/@geomtoy` for this repo. **NOTE**: We don't need to do any initialization for the submodule Geomtoy, such as `npm ci`, `lerna bootstrap`, etc.
4. Run `npm run bundle-dts-util`, `npm run bundle-dts-core`, `npm run bundle-dts-view` to compile the `.d.ts` of all Geomtoy packages.
5. Run `npm run generate` to generate.

## Notice

-   DO NOT commit code to Geomtoy from this repo **IMPORTANT**!.

## Debugging & Maintaining

-   Run the corresponding `npm run bundle-dts-***` after updating Geomtoy packages.
-   Run `npm run commit` to commit **IMPORTANT**!.
-   Sometimes symlinks may disappear, we can re-run `node create-link`.
