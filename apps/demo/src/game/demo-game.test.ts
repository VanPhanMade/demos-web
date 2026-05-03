import { describe, expect, it } from "vitest";

import { World, type InputLike, type SystemContext } from "@codex-game/engine";

import {
  Collider,
  PlayerControlled,
  Pushable,
  Transform,
  Velocity
} from "./components";
import { createDemoSystems } from "./demo-game";

class FakeInput implements InputLike {
  private axes = new Map<string, number>();

  setAxis(name: string, value: number): void {
    this.axes.set(name, value);
  }

  isDown(): boolean {
    return false;
  }

  wasPressed(): boolean {
    return false;
  }

  wasReleased(): boolean {
    return false;
  }

  getAxis(name: string): number {
    return this.axes.get(name) ?? 0;
  }
}

function runUpdateSystems(
  world: World,
  input: FakeInput,
  deltaTime = 1
): void {
  const context = {
    world,
    input,
    renderer: {},
    assets: {},
    frame: {
      deltaTime,
      alpha: 0,
      elapsedTime: deltaTime,
      tick: 1
    }
  } as unknown as SystemContext;

  for (const system of createDemoSystems()) {
    if ((system.stage ?? "update") === "update") {
      system.run(context);
    }
  }
}

function addPlayer(world: World, x: number, y: number, speed = 4): number {
  const entity = world.createEntity();
  world.addComponent(entity, Transform, { x, y });
  world.addComponent(entity, Velocity, { x: 0, y: 0 });
  world.addComponent(entity, PlayerControlled, { speed });
  world.addComponent(entity, Collider, { width: 16, height: 16, solid: true });
  return entity;
}

function addCrate(
  world: World,
  x: number,
  y: number,
  pushable = true
): number {
  const entity = world.createEntity();
  world.addComponent(entity, Transform, { x, y });
  world.addComponent(entity, Collider, { width: 16, height: 16, solid: true });

  if (pushable) {
    world.addComponent(entity, Pushable, { weight: 1 });
  }

  return entity;
}

describe("demo physics", () => {
  it("keeps WASD input scoped to the player when crates are not contacted", () => {
    const world = new World();
    const input = new FakeInput();
    const player = addPlayer(world, 0, 0);
    const crate = addCrate(world, 100, 0);

    input.setAxis("moveX", 1);
    runUpdateSystems(world, input);

    expect(world.getComponent(player, Transform)).toMatchObject({ x: 4, y: 0 });
    expect(world.getComponent(crate, Transform)).toMatchObject({ x: 100, y: 0 });
    expect(world.getComponent(crate, Velocity)).toBeUndefined();
    expect(world.getComponent(crate, PlayerControlled)).toBeUndefined();
  });

  it("pushes a crate from collision instead of giving the crate player input", () => {
    const world = new World();
    const input = new FakeInput();
    const player = addPlayer(world, 0, 0);
    const crate = addCrate(world, 16, 0);

    input.setAxis("moveX", 1);
    runUpdateSystems(world, input);

    expect(world.getComponent(player, Transform)).toMatchObject({ x: 4, y: 0 });
    expect(world.getComponent(crate, Transform)).toMatchObject({ x: 20, y: 0 });
    expect(world.getComponent(crate, Velocity)).toBeUndefined();
  });

  it("blocks the player when a pushed crate cannot move", () => {
    const world = new World();
    const input = new FakeInput();
    const player = addPlayer(world, 0, 0);
    const crate = addCrate(world, 16, 0);

    addCrate(world, 32, 0, false);

    input.setAxis("moveX", 1);
    runUpdateSystems(world, input);

    expect(world.getComponent(player, Transform)).toMatchObject({ x: 0, y: 0 });
    expect(world.getComponent(crate, Transform)).toMatchObject({ x: 16, y: 0 });
  });
});
