import { describe, expect, it, vi } from "vitest";

import { createGame, createSystem, type System } from "./game";

describe("Game", () => {
  it("runs update systems in registration order with a fixed timestep", async () => {
    const runOrder: string[] = [];
    const frameCallbacks: FrameRequestCallback[] = [];
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    const cancelAnimationFrame = vi.fn();

    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
      requestAnimationFrame,
      cancelAnimationFrame,
      innerWidth: 640,
      innerHeight: 360
    });

    vi.stubGlobal("Image", class {
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      width = 16;
      height = 16;

      set src(_: string) {
        this.onload?.();
      }
    });

    const canvas = {
      width: 0,
      height: 0,
      style: {},
      parentElement: {
        clientWidth: 640,
        clientHeight: 360
      },
      getContext: () => ({
        imageSmoothingEnabled: true,
        fillStyle: "#000",
        save() {},
        restore() {},
        setTransform() {},
        fillRect() {},
        drawImage() {}
      })
    } as unknown as HTMLCanvasElement;

    const systems: System[] = [
      createSystem("first", () => runOrder.push("first")),
      createSystem("second", () => runOrder.push("second"))
    ];

    const game = createGame({
      canvas,
      resolution: { width: 320, height: 180 },
      systems
    });

    await game.start();
    frameCallbacks[0]?.(0);
    frameCallbacks[1]?.(34);

    expect(runOrder).toEqual(["first", "second", "first", "second"]);
  });
});

