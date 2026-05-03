# How To Make Components

Use this when adding ECS state to the engine or demo game.

## Component Rules

- Define components as small data-only interfaces.
- Register component types with `defineComponent<T>("Name")`.
- Keep behavior out of components; behavior belongs in systems.
- Prefer several small components over one large component with many optional fields.

## Demo Component Location

Demo-specific components live in:

```text
apps/demo/src/game/components.ts
```

Example shape:

```ts
export interface HealthData {
  current: number;
  max: number;
}

export const Health = defineComponent<HealthData>("Health");
```

## Current Demo Components

- `Transform`: world position.
- `Velocity`: per-second motion intent.
- `Sprite`: render asset and frame.
- `PlayerControlled`: marks the entity that receives input.
- `Collider`: solid AABB size.
- `Pushable`: marks solid entities that can be pushed by collision.

## Test Rule

When a component changes behavior by enabling a new system path, add or update tests for that system. Component-only additions do not need tests until a system depends on them.

