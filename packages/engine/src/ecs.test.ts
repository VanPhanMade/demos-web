import { describe, expect, it } from "vitest";

import { World, defineComponent } from "./ecs";

describe("World", () => {
  it("adds, removes, and queries components", () => {
    const world = new World();
    const Transform = defineComponent<{ x: number; y: number }>("Transform");
    const Velocity = defineComponent<{ x: number; y: number }>("Velocity");
    const player = world.createEntity();
    const crate = world.createEntity();

    world.addComponent(player, Transform, { x: 4, y: 5 });
    world.addComponent(player, Velocity, { x: 1, y: 0 });
    world.addComponent(crate, Transform, { x: 8, y: 9 });

    expect(world.getComponent(player, Transform)).toEqual({ x: 4, y: 5 });
    expect(world.query(Transform)).toEqual([player, crate]);
    expect(world.query(Transform, Velocity)).toEqual([player]);

    world.removeComponent(player, Velocity);
    expect(world.query(Transform, Velocity)).toEqual([]);
  });

  it("removes entity data from all component stores when destroyed", () => {
    const world = new World();
    const Marker = defineComponent<boolean>("Marker");
    const entity = world.createEntity();

    world.addComponent(entity, Marker, true);
    world.destroyEntity(entity);

    expect(world.query(Marker)).toEqual([]);
  });
});

