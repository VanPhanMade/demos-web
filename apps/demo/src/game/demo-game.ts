import {
  createSystem,
  type AssetManifest,
  type SetupContext,
  type System
} from "@codex-game/engine";

import {
  PlayerControlled,
  Sprite,
  Transform,
  Velocity,
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
  world.addComponent(player, Sprite, createSprite("player"));

  const crate = world.createEntity();
  world.addComponent(crate, Transform, { x: 152, y: 96 });
  world.addComponent(crate, Sprite, createSprite("crate"));

  const crateTwo = world.createEntity();
  world.addComponent(crateTwo, Transform, { x: 216, y: 140 });
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
    createSystem("movement", ({ frame, world }) => {
      for (const entity of world.query(Transform, Velocity)) {
        const transform = world.getComponent(entity, Transform);
        const velocity = world.getComponent(entity, Velocity);

        if (!transform || !velocity) {
          continue;
        }

        transform.x = clamp(
          transform.x + velocity.x * frame.deltaTime,
          0,
          WORLD_WIDTH - 16
        );
        transform.y = clamp(
          transform.y + velocity.y * frame.deltaTime,
          0,
          WORLD_HEIGHT - 16
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
