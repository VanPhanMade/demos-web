import { createGame } from "@codex-game/engine";

import "./styles.css";
import {
  assetManifest,
  createDemoSystems,
  setupDemoScene
} from "./game/demo-game";

function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return error;
}

function log(
  level: "debug" | "info" | "warn" | "error",
  message: string,
  details?: unknown
): void {
  window.codexHost?.log(level, message, details);

  const consoleMethod = level === "debug" ? "log" : level;
  console[consoleMethod](`[Codex Pixel Engine] ${message}`, details ?? "");
}

function showStartupFailure(error: unknown): void {
  const panel = document.createElement("section");
  panel.className = "startup-error";
  panel.innerHTML = `
    <h1>Startup failed</h1>
    <p>The demo could not finish constructing the scene. Check the runtime log at:</p>
    <code>%APPDATA%\\Codex Pixel Engine Demo\\logs\\runtime-log.txt</code>
  `;
  document.body.append(panel);

  log("error", "startup failed", serializeError(error));
}

log("info", "renderer boot", {
  href: window.location.href,
  platform: window.codexHost?.platform ?? "browser"
});

const appRoot = document.querySelector<HTMLDivElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root element.");
}

const frame = document.createElement("main");
frame.className = "game-shell";

const viewport = document.createElement("section");
viewport.className = "game-viewport";

const canvas = document.createElement("canvas");
canvas.className = "game-canvas";
canvas.setAttribute("aria-label", "Codex Pixel Engine game canvas");

const hud = document.createElement("aside");
hud.className = "game-hud";
hud.innerHTML = `
  <h1>Codex Pixel Engine</h1>
  <p>Move with WASD or the arrow keys.</p>
  <p>Pixel-perfect Canvas2D rendering inside an Electron shell.</p>
`;

viewport.append(canvas);
frame.append(viewport, hud);
appRoot.append(frame);
log("info", "renderer DOM constructed");

const game = createGame({
  canvas,
  resolution: { width: 320, height: 180 },
  clearColor: "#121a29",
  fixedDeltaTime: 1 / 60,
  assetManifest,
  systems: createDemoSystems(),
  setup: (context) => {
    log("info", "ECS scene setup starting");
    setupDemoScene(context);
    log("info", "ECS scene setup completed", {
      entityCount: context.world.size
    });
  }
});

game
  .start()
  .then(() => {
    log("info", "game started", {
      entityCount: game.getWorld().size,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });
  })
  .catch(showStartupFailure);
