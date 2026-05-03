# How To Make Systems

Use this when adding or changing ECS behavior.

## System Rules

- Create systems with `createSystem(name, run, stage?)`.
- Use update systems for game logic and render systems for drawing.
- Keep system order explicit in `createDemoSystems()`.
- Query only the components a system needs.
- Mutate component data through the `World` API.

## Demo System Location

Demo systems currently live in:

```text
apps/demo/src/game/demo-game.ts
```

The current update order is:

1. `player-input`
2. `physics-movement`

The current render order is:

1. `render-scene`

## Design Rules

- Input systems should write intent, not directly teleport entities.
- Movement and collision systems should own position changes.
- Render systems should not change gameplay state.
- Systems should be deterministic for a fixed world state, input state, and frame delta.

## Test Rule

Add unit tests when system order, component queries, movement rules, collision rules, or input behavior changes.

