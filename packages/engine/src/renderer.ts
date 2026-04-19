export interface Resolution {
  width: number;
  height: number;
}

export interface SpriteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteImageLike {
  width: number;
  height: number;
}

export type ScaleMode = "integer-fit" | "fit";

export interface DisplaySize {
  width: number;
  height: number;
  scale: number;
}

export function calculateDisplaySize(
  resolution: Resolution,
  availableWidth: number,
  availableHeight: number,
  scaleMode: ScaleMode = "integer-fit"
): DisplaySize {
  const rawScale = Math.min(
    availableWidth / resolution.width,
    availableHeight / resolution.height
  );
  const safeScale = Number.isFinite(rawScale) ? rawScale : 1;

  let scale = safeScale;
  if (scaleMode === "integer-fit" && safeScale >= 1) {
    scale = Math.max(1, Math.floor(safeScale));
  }

  if (scale <= 0) {
    scale = 1;
  }

  return {
    width: Math.max(1, Math.round(resolution.width * scale)),
    height: Math.max(1, Math.round(resolution.height * scale)),
    scale
  };
}

export class CanvasRenderer {
  readonly context: CanvasRenderingContext2D;
  readonly resolution: Resolution;

  private cameraX = 0;
  private cameraY = 0;

  constructor(
    readonly canvas: HTMLCanvasElement,
    resolution: Resolution,
    private readonly scaleMode: ScaleMode = "integer-fit"
  ) {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("Could not create a 2D rendering context.");
    }

    this.context = context;
    this.resolution = resolution;
    this.canvas.width = resolution.width;
    this.canvas.height = resolution.height;
    this.canvas.style.imageRendering = "pixelated";
    this.context.imageSmoothingEnabled = false;
  }

  clear(color: string): void {
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
  }

  setCamera(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
  }

  resetCamera(): void {
    this.setCamera(0, 0);
  }

  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ): void {
    this.context.fillStyle = color;
    this.context.fillRect(
      Math.round(x - this.cameraX),
      Math.round(y - this.cameraY),
      width,
      height
    );
  }

  drawSprite(
    image: CanvasImageSource,
    source: SpriteRect,
    x: number,
    y: number,
    width = source.width,
    height = source.height
  ): void {
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(
      image,
      source.x,
      source.y,
      source.width,
      source.height,
      Math.round(x - this.cameraX),
      Math.round(y - this.cameraY),
      width,
      height
    );
  }

  resizeToFit(availableWidth: number, availableHeight: number): DisplaySize {
    const display = calculateDisplaySize(
      this.resolution,
      availableWidth,
      availableHeight,
      this.scaleMode
    );

    this.canvas.style.width = `${display.width}px`;
    this.canvas.style.height = `${display.height}px`;

    return display;
  }

  resizeToParent(): DisplaySize {
    const parent = this.canvas.parentElement;
    if (parent) {
      return this.resizeToFit(parent.clientWidth, parent.clientHeight);
    }

    return this.resizeToFit(window.innerWidth, window.innerHeight);
  }
}

