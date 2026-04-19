import { createGame } from "@codex-game/engine";

import "./styles.css";
import {
  assetManifest,
  createDemoSystems,
  setupDemoScene
} from "./game/demo-game";

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

const game = createGame({
  canvas,
  resolution: { width: 320, height: 180 },
  clearColor: "#121a29",
  fixedDeltaTime: 1 / 60,
  assetManifest,
  systems: createDemoSystems(),
  setup: setupDemoScene
});

void game.start();
