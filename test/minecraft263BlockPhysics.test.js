/* eslint-env mocha */

const { Physics, PlayerState } = require('prismarine-physics')
const { Vec3 } = require('vec3')
const expect = require('expect')
const features = require('../lib/features.json')

const mcData = require('minecraft-data')('26.3')
const Block = require('prismarine-block')('26.3')

const noControls = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
  sneak: false
}

function makeBlock (name, properties, pos, BlockType = Block) {
  const block = BlockType.fromProperties(name, properties)
  block.position = pos.clone()
  return block
}

function makePlayer (position, velocity = new Vec3(0, 0, 0), onGround = false, version = '26.3') {
  return {
    entity: {
      position,
      velocity,
      onGround,
      isInWater: false,
      isInLava: false,
      isInWeb: false,
      isCollidedHorizontally: false,
      isCollidedVertically: false,
      elytraFlying: false,
      yaw: 0,
      pitch: 0,
      effects: {},
      attributes: {}
    },
    jumpTicks: 0,
    jumpQueued: false,
    fireworkRocketDuration: 0,
    version,
    inventory: { slots: [] }
  }
}

function createWorld (getBlockNameAndProperties, BlockType = Block) {
  return {
    getBlock: (pos) => {
      const blockPos = new Vec3(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z))
      const { name, properties = {} } = getBlockNameAndProperties(blockPos)
      return makeBlock(name, properties, blockPos, BlockType)
    }
  }
}

function makeTrapdoorWorld (trapdoorFacing, ladderFacing, open = true) {
  return createWorld((pos) => {
    if (pos.y === 61) {
      return {
        name: 'poplar_trapdoor',
        properties: {
          facing: trapdoorFacing,
          half: 'bottom',
          open,
          powered: false,
          waterlogged: false
        }
      }
    }
    if (pos.y === 60) {
      return {
        name: 'ladder',
        properties: { facing: ladderFacing, waterlogged: false }
      }
    }
    return { name: pos.y < 60 ? 'stone' : 'air' }
  })
}

function runOneTick (player, world, controls = noControls, data = mcData) {
  const physics = Physics(data, world)
  physics.simulatePlayer(new PlayerState(player, controls), world).apply(player)
  return player
}

describe('Minecraft 26.3 block physics', () => {
  it('enables support-block slowdown and climbable trapdoors on 26.3 while retaining older gates', () => {
    const featureVersions = (name) => features.find(feature => feature.name === name).versions

    expect(featureVersions('velocityBlocksOnTop')).toContain('26.3')
    expect(featureVersions('climbableTrapdoor')).toContain('26.3')
    expect(featureVersions('velocityBlocksOnCollision')).not.toContain('26.3')
    expect(featureVersions('honeyblockJumpFactor')).toContain('26.3')
    expect(featureVersions('partialHeightSupportSample')).toContain('26.3')
    expect(featureVersions('velocityBlocksOnTop')).toContain('1.20')
    expect(featureVersions('velocityBlocksOnCollision')).toContain('1.14')
    for (const version of ['26.1', '26.2']) {
      expect(featureVersions('velocityBlocksOnTop')).not.toContain(version)
      expect(featureVersions('climbableTrapdoor')).not.toContain(version)
      expect(featureVersions('honeyblockJumpFactor')).not.toContain(version)
      expect(featureVersions('partialHeightSupportSample')).not.toContain(version)
    }
    expect(featureVersions('honeyblockJumpFactor')).not.toContain('1.20')
    expect(featureVersions('partialHeightSupportSample')).not.toContain('1.20')
  })

  for (const facing of ['north', 'east', 'south', 'west']) {
    it(`lets a player climb an open Poplar trapdoor facing ${facing} when its ladder matches`, () => {
      const world = makeTrapdoorWorld(facing, facing)
      const player = makePlayer(new Vec3(0.5, 61, 0.5))
      const controls = { ...noControls, jump: true }

      runOneTick(player, world, controls)

      expect(player.entity.velocity.y).toBeGreaterThan(0)
    })
  }

  it('does not climb a closed Poplar trapdoor', () => {
    const world = makeTrapdoorWorld('north', 'north', false)
    const player = makePlayer(new Vec3(0.5, 61, 0.5))

    runOneTick(player, world, { ...noControls, jump: true })

    expect(player.entity.velocity.y).toBeLessThanOrEqual(0)
  })

  it('does not climb an open Poplar trapdoor when the ladder faces another direction', () => {
    const world = makeTrapdoorWorld('north', 'east')
    const player = makePlayer(new Vec3(0.5, 61, 0.5))

    runOneTick(player, world, { ...noControls, jump: true })

    expect(player.entity.velocity.y).toBeLessThanOrEqual(0)
  })

  for (const supportName of ['soul_sand', 'honey_block']) {
    it(`applies the 26.3 support-block speed factor for ${supportName}`, () => {
      function horizontalVelocity (blockName) {
        const world = createWorld((pos) => ({ name: pos.y === 59 ? blockName : (pos.y < 59 ? 'stone' : 'air') }))
        const player = makePlayer(new Vec3(0.5, 60, 0.5), new Vec3(0, 0, 0.1), true)

        runOneTick(player, world)

        return player.entity.velocity.z
      }

      expect(horizontalVelocity(supportName)).toBeCloseTo(0.02184, 6)
      expect(horizontalVelocity('stone')).toBeCloseTo(0.0546, 6)
    })

    it(`recognizes ${supportName} beneath a 1/16-block lowered standing position`, () => {
      const world = createWorld((pos) => ({ name: pos.y === 59 ? supportName : (pos.y < 59 ? 'stone' : 'air') }))
      const player = makePlayer(new Vec3(0.5, 60 - 1 / 16, 0.5), new Vec3(0, 0, 0.1), true)

      runOneTick(player, world)

      expect(player.entity.velocity.z).toBeCloseTo(0.02184, 6)
    })
  }

  it('uses the 0.5 honey-block jump factor for the 26.3 jump impulse', () => {
    const world = createWorld((pos) => ({ name: pos.y === 59 ? 'honey_block' : (pos.y < 59 ? 'stone' : 'air') }))
    const player = makePlayer(new Vec3(0.5, 60 - 1 / 16, 0.5), new Vec3(0, 0, 0), true)

    runOneTick(player, world, { ...noControls, jump: true })

    // 0.42 * 0.5 honey jump factor, then one gravity and air-drag step.
    expect(player.entity.velocity.y).toBeCloseTo(0.1274, 4)
  })

  it('retains the existing pre-26.3 honey-block jump result on 1.20.1', () => {
    const oldMcData = require('minecraft-data')('1.20.1')
    const OldBlock = require('prismarine-block')('1.20.1')
    const world = createWorld((pos) => ({ name: pos.y === 59 ? 'honey_block' : (pos.y < 59 ? 'stone' : 'air') }), OldBlock)
    const player = makePlayer(new Vec3(0.5, 60, 0.5), new Vec3(0, 0, 0), true, '1.20.1')

    runOneTick(player, world, { ...noControls, jump: true }, oldMcData)

    expect(player.entity.velocity.y).toBeCloseTo(0.08624, 4)
  })
})
