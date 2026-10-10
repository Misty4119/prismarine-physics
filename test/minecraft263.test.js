/* eslint-env mocha */

const { Physics, PlayerState } = require('prismarine-physics')
const { Vec3 } = require('vec3')
const expect = require('expect')

const mcData = require('minecraft-data')('26.3')
const Block = require('prismarine-block')('26.3')

function makeBlock (name, properties, pos) {
  const block = Block.fromProperties(name, properties)
  block.position = pos.clone()
  return block
}

function makePlayer (position, attributes = {}) {
  return {
    entity: {
      position,
      velocity: new Vec3(0, 0, 0),
      onGround: false,
      isInWater: false,
      isInLava: false,
      isInWeb: false,
      isCollidedHorizontally: false,
      isCollidedVertically: false,
      elytraFlying: false,
      yaw: 0,
      pitch: 0,
      effects: {},
      attributes
    },
    jumpTicks: 0,
    jumpQueued: false,
    fireworkRocketDuration: 0,
    version: '26.3',
    inventory: { slots: [] }
  }
}

const noControls = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
  sneak: false
}

describe('Minecraft 26.3 protocol 777 physics data', () => {
  it('loads the exact 26.3 protocol, data version, and movement attribute registry', () => {
    expect(mcData.version.majorVersion).toBe('26.3')
    expect(mcData.version.version).toBe(777)
    expect(mcData.version.dataVersion).toBe(5023)
    expect(mcData.attributesByName.movementSpeed.resource).toBe('minecraft:movement_speed')
    expect(Block.fromProperties('scaffolding', { bottom: false, distance: 0, waterlogged: false }).name).toBe('scaffolding')
  })

  for (const [liquidName, expectedGravity] of [['water', -0.005], ['lava', -0.02]]) {
    it(`uses proportional ${liquidName} gravity with exact 26.3 blocks`, () => {
      const world = {
        getBlock: (pos) => makeBlock(liquidName, { level: 0 }, pos)
      }
      const physics = Physics(mcData, world)
      const player = makePlayer(new Vec3(0, 10, 0))
      const state = new PlayerState(player, noControls)

      physics.simulatePlayer(state, world).apply(player)

      expect(liquidName === 'water' ? player.entity.isInWater : player.entity.isInLava).toBeTruthy()
      expect(player.entity.velocity.y).toBeCloseTo(expectedGravity)
    })
  }

  it('uses the 26.3 movement-speed attribute resource from the registry', () => {
    const world = {
      getBlock: (pos) => makeBlock(pos.y < 60 ? 'stone' : 'air', {}, pos)
    }
    const resource = mcData.attributesByName.movementSpeed.resource
    const controls = { ...noControls, forward: true }

    function simulateWithAttributes (attributes) {
      const physics = Physics(mcData, world)
      const player = makePlayer(new Vec3(0, 60, 0), attributes)
      player.entity.onGround = true
      const state = new PlayerState(player, controls)
      physics.simulatePlayer(state, world).apply(player)
      return player
    }

    const reducedSpeed = simulateWithAttributes({
      [resource]: { value: 0.05, modifiers: [] }
    })
    const defaultSpeed = simulateWithAttributes({})

    expect(Math.abs(reducedSpeed.entity.velocity.z)).toBeLessThan(Math.abs(defaultSpeed.entity.velocity.z))
  })
})
