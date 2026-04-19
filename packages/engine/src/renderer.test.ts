import { describe, expect, it } from "vitest";

import { buildFrameMap } from "./assets";
import { calculateDisplaySize, CanvasRenderer } from "./renderer";

class FakeContext {
  imageSmoothingEnabled = true;
  fillStyle = "#000";
  readonly drawImageCalls: unknown[][] = [];
  readonly fillRectCalls: unknown[][] = [];

  save(): void {}
  restore(): void {}
  setTransform(): void {}
  fillRect(...args: unknown[]): void {
    this.fillRectCalls.push(args);
  }
  drawImage(...args: unknown[]): void {
    this.drawImageCalls.push(args);
  }
}

class FakeCanvas {
  width = 0;
  height = 0;
  style: Record<string, string> = {};
  parentElement = {
    clientWidth: 960,
    clientHeight: 540
  };

  private readonly context = new FakeContext();

  getContext(): CanvasRenderingContext2D {
    return this.context as unknown as CanvasRenderingContext2D;
  }
}

describe("renderer sizing", () => {
  it("keeps integer scaling when there is room", () => {
    expect(calculateDisplaySize({ width: 320, height: 180 }, 1000, 800)).toEqual({
      width: 960,
      height: 540,
      scale: 3
    });
  });

  it("falls back to fractional fit when the window is smaller than the game", () => {
    const display = calculateDisplaySize({ width: 320, height: 180 }, 160, 90);

    expect(display.width).toBe(160);
    expect(display.height).toBe(90);
    expect(display.scale).toBe(0.5);
  });
});

describe("CanvasRenderer", () => {
  it("disables smoothing and rounds draw positions", () => {
    const canvas = new FakeCanvas() as unknown as HTMLCanvasElement;
    const renderer = new CanvasRenderer(canvas, { width: 320, height: 180 });
    const context = renderer.context as unknown as FakeContext;

    renderer.setCamera(4, 2);
    renderer.drawSprite({ width: 16, height: 16 } as CanvasImageSource, {
      x: 0,
      y: 0,
      width: 16,
      height: 16
    }, 10.4, 20.7);

    expect(context.imageSmoothingEnabled).toBe(false);
    expect(context.drawImageCalls[0]?.slice(-4)).toEqual([6, 19, 16, 16]);
  });

  it("resizes the canvas display to its parent container", () => {
    const canvas = new FakeCanvas() as unknown as HTMLCanvasElement;
    const renderer = new CanvasRenderer(canvas, { width: 320, height: 180 });

    renderer.resizeToParent();

    expect(canvas.style.width).toBe("960px");
    expect(canvas.style.height).toBe("540px");
  });
});

describe("sprite frame generation", () => {
  it("builds source rectangles from frame dimensions", () => {
    const frames = buildFrameMap(
      { src: "/sprites.png", frameWidth: 16, frameHeight: 16 },
      { width: 32, height: 16 }
    );

    expect(frames["0"]).toEqual({ x: 0, y: 0, width: 16, height: 16 });
    expect(frames["1"]).toEqual({ x: 16, y: 0, width: 16, height: 16 });
  });
});

