# Contributing to prismarine-physics

See the [Prismarine contribution guide](https://github.com/PrismarineJS/mineflayer/blob/master/docs/CONTRIBUTING.md) for the shared contribution process. This repository's package guide is [README.md](README.md).

Read [CONTEXT.md](CONTEXT.md) before changing movement, collision, or version behavior. Read [SECURITY.md](SECURITY.md) before processing untrusted world or plugin inputs. `index.js` exports the Physics factory and PlayerState; `lib/features.json` controls version behavior. Preserve positions and velocities in blocks per tick, angles in radians, and the in-place PlayerState mutation contract. Keep collision ordering, epsilon handling, and prior-version fixtures stable.

## Minecraft 26.3 and data provenance

The 26.3/protocol 777 registry comes from the merged [minecraft-data source](https://github.com/Misty4119/minecraft-data/commit/1d37505b338710f2f347aa00efaa48a054754b19). CI prepares it through [node-minecraft-data](https://github.com/PrismarineJS/node-minecraft-data/commit/308134a8020139d49ceb851c97713ae15b745192), then checks the actual import used by `prismarine-block`. The sibling [prismarine-chunk merge](https://github.com/Misty4119/prismarine-chunk/commit/23149f443d08aa15c4d4ddc868dfd3536c7b6110) and [prismarine-item merge](https://github.com/Misty4119/prismarine-item/commit/9c3c7ab88aab28072a0222b9bfa599e516fcbaf9) belong to the wider integration; this package does not depend on them directly.

An isolated `npm install` can resolve published data without 26.3. To reproduce the release work, use the CI checkout and prepare steps or the sibling runtime in the Mineflayer checkout. Record the exact registry source, resolved import path, protocol number, and data version with test results. Update these immutable references when advancing the integration.

## Checks

From the repository root:

```sh
npm install
npm run lint
npx mocha test/minecraft263.test.js test/minecraft263BlockPhysics.test.js test/scaffolding.test.js --grep '26\.3|Minecraft 26.3' --reporter spec --exit
npm test
git diff --check
```

`npm test` runs lint through `pretest` and then the full Mocha suite. CI currently uses Node 24; the package has no declared minimum Node version. Add deterministic worlds and boundary cases for collision or movement changes. Keep work over caller-provided worlds bounded, and do not commit credentials, private world data, or identifying packet captures.
