import { AssetStore, type AssetManifest, loadAssets } from "./assets";
import { World } from "./ecs";
import { KeyboardInput, type InputLike } from "./input";
import {
  CanvasRenderer,
  type Resolution,
  type ScaleMode
} from "./renderer";

export type SystemStage = "update" | "render";

export interface FrameInfo {
  deltaTime: number;
  alpha: number;
  elapsedTime: number;
  tick: number;
}

export interface SystemContext {
  world: World;
  input: InputLike;
  renderer: CanvasRenderer;
  assets: AssetStore;
  frame: FrameInfo;
}

export interface System {
  name: string;
  stage?: SystemStage;
  run(context: SystemContext): void;
}

export interface SetupContext {
  world: World;
  input: KeyboardInput;
  renderer: CanvasRenderer;
  assets: AssetStore;
}

export interface GameConfig {
  canvas: HTMLCanvasElement;
  resolution: Resolution;
  systems: System[];
  assetManifest?: AssetManifest;
  clearColor?: string;
  fixedDeltaTime?: number;
  scaleMode?: ScaleMode;
  setup?(context: SetupContext): void | Promise<void>;
  createInput?(source: Window): KeyboardInput;
}

export function createSystem(
  name: string,
  run: (context: SystemContext) => void,
  stage: SystemStage = "update"
): System {
  return { name, run, stage };
}

export class Game {
  private readonly world = new World();
  private readonly renderer: CanvasRenderer;
  private readonly input: KeyboardInput;
  private assets = new AssetStore({});
  private readonly fixedDeltaTime: number;
  private readonly clearColor: string;
  private readonly updateSystems: System[];
  private readonly renderSystems: System[];
  private accumulator = 0;
  private elapsedTime = 0;
  private lastTimestamp: number | null = null;
  private tick = 0;
  private animationFrameId = 0;
  private running = false;
  private initialized = false;

  private readonly onResize = (): void => {
    this.renderer.resizeToParent();
  };

  constructor(private readonly config: GameConfig) {
    this.renderer = new CanvasRenderer(
      config.canvas,
      config.resolution,
      config.scaleMode ?? "integer-fit"
    );
    this.input = config.createInput
      ? config.createInput(window)
      : new KeyboardInput(window);
    this.fixedDeltaTime = config.fixedDeltaTime ?? 1 / 60;
    this.clearColor = config.clearColor ?? "#0f1720";
    this.updateSystems = config.systems.filter(
      (system) => (system.stage ?? "update") === "update"
    );
    this.renderSystems = config.systems.filter(
      (system) => (system.stage ?? "update") === "render"
    );
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.assets = await loadAssets(this.config.assetManifest);
    await this.config.setup?.({
      world: this.world,
      input: this.input,
      renderer: this.renderer,
      assets: this.assets
    });

    this.renderer.resizeToParent();
    window.addEventListener("resize", this.onResize);
    this.initialized = true;
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = null;
    this.animationFrameId = window.requestAnimationFrame(this.onFrame);
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    window.cancelAnimationFrame(this.animationFrameId);
  }

  dispose(): void {
    this.stop();
    this.input.dispose();
    window.removeEventListener("resize", this.onResize);
  }

  getWorld(): World {
    return this.world;
  }

  getRenderer(): CanvasRenderer {
    return this.renderer;
  }

  getInput(): KeyboardInput {
    return this.input;
  }

  private readonly onFrame = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const previousTimestamp =
      this.lastTimestamp === null ? timestamp : this.lastTimestamp;
    const deltaSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.25);
    this.lastTimestamp = timestamp;
    this.accumulator += deltaSeconds;
    this.elapsedTime += deltaSeconds;

    while (this.accumulator >= this.fixedDeltaTime) {
      this.tick += 1;
      this.runSystems(this.updateSystems, {
        deltaTime: this.fixedDeltaTime,
        alpha: 0,
        elapsedTime: this.elapsedTime,
        tick: this.tick
      });
      this.accumulator -= this.fixedDeltaTime;
    }

    this.renderer.clear(this.clearColor);
    this.runSystems(this.renderSystems, {
      deltaTime: deltaSeconds,
      alpha: this.accumulator / this.fixedDeltaTime,
      elapsedTime: this.elapsedTime,
      tick: this.tick
    });
    this.input.endFrame();

    this.animationFrameId = window.requestAnimationFrame(this.onFrame);
  };

  private runSystems(systems: System[], frame: FrameInfo): void {
    const context: SystemContext = {
      world: this.world,
      input: this.input,
      renderer: this.renderer,
      assets: this.assets,
      frame
    };

    for (const system of systems) {
      system.run(context);
    }
  }
}

export function createGame(config: GameConfig): Game {
  return new Game(config);
}
