import {
  createSystem,
  type AssetManifest,
  type SetupContext,
  type System
} from "@codex-game/engine";

import {
  Collider,
  PlayerControlled,
  Pushable,
  Sprite,
  Transform,
  Velocity,
  type ColliderData,
  type SpriteData
} from "./components";

const WORLD_WIDTH = 640;
const WORLD_HEIGHT = 360;

export const assetManifest: AssetManifest = {
  demoSprites: {
    src: "./assets/sprites/demo-sprites.png",
    frames: {
      player: { x: 0, y: 0, width: 16, height: 16 },
      crate: { x: 16, y: 0, width: 16, height: 16 }
    }
  }
};

export function setupDemoScene({ world, input }: SetupContext): void {
  input.bindAxis("moveX", {
    negative: ["ArrowLeft", "KeyA"],
    positive: ["ArrowRight", "KeyD"]
  });
  input.bindAxis("moveY", {
    negative: ["ArrowUp", "KeyW"],
    positive: ["ArrowDown", "KeyS"]
  });

  const player = world.createEntity();
  world.addComponent(player, Transform, { x: 48, y: 48 });
  world.addComponent(player, Velocity, { x: 0, y: 0 });
  world.addComponent(player, PlayerControlled, { speed: 72 });
  world.addComponent(player, Collider, createCollider());
  world.addComponent(player, Sprite, createSprite("player"));

  const crate = world.createEntity();
  world.addComponent(crate, Transform, { x: 152, y: 96 });
  world.addComponent(crate, Collider, createCollider());
  world.addComponent(crate, Pushable, { weight: 1 });
  world.addComponent(crate, Sprite, createSprite("crate"));

  const crateTwo = world.createEntity();
  world.addComponent(crateTwo, Transform, { x: 216, y: 140 });
  world.addComponent(crateTwo, Collider, createCollider());
  world.addComponent(crateTwo, Pushable, { weight: 1 });
  world.addComponent(crateTwo, Sprite, createSprite("crate"));
}

export function createDemoSystems(): System[] {
  return [
    createSystem("player-input", ({ input, world }) => {
      for (const entity of world.query(PlayerControlled, Velocity)) {
        const player = world.getComponent(entity, PlayerControlled);
        const velocity = world.getComponent(entity, Velocity);

        if (!player || !velocity) {
          continue;
        }

        velocity.x = input.getAxis("moveX") * player.speed;
        velocity.y = input.getAxis("moveY") * player.speed;
      }
    }),
    createSystem("physics-movement", ({ frame, world }) => {
      for (const entity of world.query(Transform, Velocity, Collider)) {
        const transform = world.getComponent(entity, Transform);
        const velocity = world.getComponent(entity, Velocity);

        if (!transform || !velocity) {
          continue;
        }

        moveWithCollision(
          entity,
          velocity.x * frame.deltaTime,
          0,
          world
        );
        moveWithCollision(
          entity,
          0,
          velocity.y * frame.deltaTime,
          world
        );
      }
    }),
    createSystem(
      "render-scene",
      ({ assets, renderer, world }) => {
        drawBackground(renderer);

        const playerEntity = world.query(PlayerControlled, Transform)[0];
        const playerTransform =
          playerEntity === undefined
            ? undefined
            : world.getComponent(playerEntity, Transform);

        if (playerTransform) {
          renderer.setCamera(
            clamp(
              playerTransform.x - renderer.resolution.width / 2 + 8,
              0,
              WORLD_WIDTH - renderer.resolution.width
            ),
            clamp(
              playerTransform.y - renderer.resolution.height / 2 + 8,
              0,
              WORLD_HEIGHT - renderer.resolution.height
            )
          );
        } else {
          renderer.resetCamera();
        }

        for (const entity of world.query(Transform, Sprite)) {
          const transform = world.getComponent(entity, Transform);
          const sprite = world.getComponent(entity, Sprite);

          if (!transform || !sprite) {
            continue;
          }

          const sheet = assets.getSheet(sprite.assetId);
          const frame = assets.getFrame(sprite.assetId, sprite.frame);

          renderer.drawSprite(
            sheet.image,
            frame,
            transform.x,
            transform.y,
            sprite.width,
            sprite.height
          );
        }
      },
      "render"
    )
  ];
}

function createSprite(frame: string): SpriteData {
  return {
    assetId: "demoSprites",
    frame,
    width: 16,
    height: 16
  };
}

function createCollider(): ColliderData {
  return {
    width: 16,
    height: 16,
    solid: true
  };
}

function moveWithCollision(
  entity: number,
  deltaX: number,
  deltaY: number,
  world: SetupContext["world"]
): void {
  if (deltaX === 0 && deltaY === 0) {
    return;
  }

  const transform = world.getComponent(entity, Transform);
  const collider = world.getComponent(entity, Collider);

  if (!transform || !collider) {
    return;
  }

  const originalX = transform.x;
  const originalY = transform.y;
  transform.x = clamp(transform.x + deltaX, 0, WORLD_WIDTH - collider.width);
  transform.y = clamp(transform.y + deltaY, 0, WORLD_HEIGHT - collider.height);

  const collision = findCollision(entity, world);
  if (!collision) {
    return;
  }

  const pushSucceeded =
    world.hasComponent(collision, Pushable) &&
    pushEntity(collision, deltaX, deltaY, entity, world);

  if (pushSucceeded && !findCollision(entity, world)) {
    return;
  }

  transform.x = originalX;
  transform.y = originalY;
}

function pushEntity(
  entity: number,
  deltaX: number,
  deltaY: number,
  pusher: number,
  world: SetupContext["world"]
): boolean {
  const transform = world.getComponent(entity, Transform);
  const collider = world.getComponent(entity, Collider);

  if (!transform || !collider) {
    return false;
  }

  const originalX = transform.x;
  const originalY = transform.y;
  const nextX = transform.x + deltaX;
  const nextY = transform.y + deltaY;

  if (
    nextX < 0 ||
    nextY < 0 ||
    nextX + collider.width > WORLD_WIDTH ||
    nextY + collider.height > WORLD_HEIGHT
  ) {
    return false;
  }

  transform.x = nextX;
  transform.y = nextY;

  const blocked = findCollision(entity, world, pusher);
  if (blocked) {
    transform.x = originalX;
    transform.y = originalY;
    return false;
  }

  return true;
}

function findCollision(
  entity: number,
  world: SetupContext["world"],
  ignoredEntity?: number
): number | undefined {
  const transform = world.getComponent(entity, Transform);
  const collider = world.getComponent(entity, Collider);

  if (!transform || !collider || !collider.solid) {
    return undefined;
  }

  for (const other of world.query(Transform, Collider)) {
    if (other === entity || other === ignoredEntity) {
      continue;
    }

    const otherTransform = world.getComponent(other, Transform);
    const otherCollider = world.getComponent(other, Collider);

    if (!otherTransform || !otherCollider || !otherCollider.solid) {
      continue;
    }

    if (
      overlaps(
        transform,
        collider,
        otherTransform,
        otherCollider
      )
    ) {
      return other;
    }
  }

  return undefined;
}

function overlaps(
  leftTransform: { x: number; y: number },
  leftCollider: ColliderData,
  rightTransform: { x: number; y: number },
  rightCollider: ColliderData
): boolean {
  return (
    leftTransform.x < rightTransform.x + rightCollider.width &&
    leftTransform.x + leftCollider.width > rightTransform.x &&
    leftTransform.y < rightTransform.y + rightCollider.height &&
    leftTransform.y + leftCollider.height > rightTransform.y
  );
}

function drawBackground(
  renderer: Pick<
    SetupContext["renderer"],
    "fillRect" | "resolution" | "setCamera"
  >
): void {
  renderer.setCamera(0, 0);

  for (let x = 0; x < WORLD_WIDTH; x += 16) {
    for (let y = 0; y < WORLD_HEIGHT; y += 16) {
      const evenTile = (x / 16 + y / 16) % 2 === 0;
      renderer.fillRect(
        x,
        y,
        16,
        16,
        evenTile ? "#1d2a3f" : "#162234"
      );
    }
  }

  renderer.fillRect(136, 80, 48, 48, "#0f1320");
  renderer.fillRect(200, 124, 48, 48, "#0f1320");
  renderer.fillRect(24, WORLD_HEIGHT - 40, WORLD_WIDTH - 48, 8, "#425d88");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
