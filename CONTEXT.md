# prismarine-physics repository context

## Purpose

prismarine-physics supplies Minecraft entity movement and collision simulation for PrismarineJS consumers. The package exports a Physics factory, PlayerState, and AABB helpers through index.js. The current package is 1.11.1 and has no declared Node.js engine requirement.

## Simulation boundary

Physics(mcData, world) binds version data and a world adapter. The world must provide getBlock(position), returning blocks with the collision, liquid, ladder/scaffolding, and movement properties consumed by the simulator. simulatePlayer(playerState, world) updates the player state in place. The caller owns the world and player-state lifecycle.

The engine models gravity, drag, jumping, sprinting, sneaking, fluids, ladders and scaffolding, elytra movement, collision boxes, attributes, and vehicle-related movement where represented by the current code. Numeric conventions follow the existing API: positions and velocities are block units per tick and angles use radians where the code expects them.

## Source map

- index.js is the public factory and simulation entry.
- lib/aabb.js is axis-aligned collision geometry.
- lib/math.js contains vector and numeric helpers.
- lib/attribute.js contains attribute and modifier calculations.
- lib/features.json records version gates and feature capabilities.
- test/ contains the behavior suite; examples/ contains runnable demonstrations.

minecraft-data supplies version registries and block/entity properties. prismarine-nbt and vec3 provide data and vector primitives. Mineflayer uses this engine through its physics plugin.

## Version behavior

Use registry feature support and lib/features.json for differences across Minecraft releases. The current feature map includes the 26.2 and 26.3 paths used by the sibling project updates. A new release should add or adjust a feature only when the vanilla behavior is understood and a regression test documents it.

## Numerical and lifecycle pitfalls

- PlayerState is intentionally mutable; cloning or replacing it can break caller code.
- Collision boxes must be tested at boundaries, negative coordinates, and stacked shapes.
- Small epsilon choices affect stepping, grounding, and tunneling.
- A world adapter that returns incomplete or changing blocks can make results nondeterministic.
- Loops over collision boxes or fluid volumes must remain bounded for plugin-provided input.
- Keep features data-driven so older versions retain their historical behavior.


## Published versus local source

The current 26.2/26.3 feature paths are after the published 1.11.1 release. A standalone install is not evidence for this fork's complete compatibility path; the validated setup uses sibling checkouts and local dependency state. Record the registry and sibling commits used in any result.
