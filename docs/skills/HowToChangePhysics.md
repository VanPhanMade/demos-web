# How To Change Physics

Use this when changing movement, collision, pushing, blocking, or world bounds.

## Current Model

The demo uses simple AABB collision:

- `Collider` gives an entity a solid rectangle.
- `Pushable` marks solid objects the player can push.
- `Velocity` is applied through `physics-movement`.
- Movement is axis-separated: X movement resolves, then Y movement resolves.
- If a pushable object cannot move, the pusher is restored to its previous position.

## Important Behavior

- WASD and arrow input should only affect entities with `PlayerControlled` and `Velocity`.
- Crates should not receive `Velocity` or `PlayerControlled`.
- Crates move only when pushed by a collider.
- Static solid objects should block movement.

## Current Test Cases

Tests live in:

```text
apps/demo/src/game/demo-game.test.ts
```

They cover:

- Input moves only the player when no crate is contacted.
- Contact pushes a crate without giving it input.
- A blocked crate prevents player clipping.

## Expansion Notes

Before adding richer physics, keep this v1 deterministic and testable. Add new rules through small components, such as `Mass`, `StaticBody`, `Trigger`, or `CollisionLayer`, only when a real behavior needs them.

