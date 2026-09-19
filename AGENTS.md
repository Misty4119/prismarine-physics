# Agent instructions for prismarine-physics

## Read first

Read [CONTEXT.md](CONTEXT.md) before changing collision, movement, attributes, or version behavior. Read [SECURITY.md](SECURITY.md) before processing untrusted world implementations, plugin inputs, or inputs that can cause expensive simulation. Use [README.md](README.md), index.js, and the relevant files under lib/ as the public and implementation references.

## Source of truth

- index.js exports the Physics factory and the PlayerState/AABB helpers.
- lib/aabb.js and lib/math.js define collision geometry and numerical helpers.
- lib/attribute.js models entity attributes and modifiers.
- lib/features.json is the version-feature table. Prefer a feature entry over scattered version comparisons.
- test/ contains deterministic movement, collision, fluid, ladder, elytra, and attribute coverage.

## Change rules

- Keep positions and velocities in blocks per tick and angles in radians, matching the existing API.
- Physics mutates the supplied PlayerState during simulatePlayer. Preserve that contract and document any new mutation.
- The world supplied to Physics must provide getBlock(position) with the block properties used by collision and movement code. Keep test worlds deterministic.
- Put version differences in lib/features.json or a narrowly scoped guard. Do not change historical movement behavior for every version to fix one release.
- Preserve collision ordering, epsilon handling, jump/sprint/sneak transitions, liquid and ladder behavior, and attribute modifiers.
- Avoid unbounded loops or expensive geometry when a plugin supplies malformed blocks or world coordinates. See SECURITY.md.

## Commands and completion

From the repository root:

    npm install
    npm run lint
    npm test

npm test runs lint first. Use focused Mocha tests while iterating, then inspect numerical edge cases and run git diff --check. This package has no engines field; do not document a minimum Node version unless package.json and CI are changed.


## Reproducing this fork's release work

The 26.2/26.3 feature-map changes are newer than the current published package. npm install in an isolated clone can resolve older published minecraft-data and does not reproduce the sibling checkout used by the fork. Validate cross-repository behavior with the adjacent repositories and exact commits.
