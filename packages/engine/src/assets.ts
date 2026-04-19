import type { SpriteRect } from "./renderer";

export interface SpriteSheetDefinition {
  src: string;
  frames?: Record<string, SpriteRect>;
  frameWidth?: number;
  frameHeight?: number;
}

export type AssetManifest = Record<string, SpriteSheetDefinition>;

export interface SpriteSheet {
  readonly image: HTMLImageElement;
  readonly frames: Record<string, SpriteRect>;
  readonly defaultFrame: SpriteRect;
}

export type ImageLoader = (source: string) => Promise<HTMLImageElement>;

export function buildFrameMap(
  definition: SpriteSheetDefinition,
  image: { width: number; height: number }
): Record<string, SpriteRect> {
  if (definition.frames && Object.keys(definition.frames).length > 0) {
    return definition.frames;
  }

  if (definition.frameWidth && definition.frameHeight) {
    const frames: Record<string, SpriteRect> = {};
    const columns = Math.max(1, Math.floor(image.width / definition.frameWidth));
    const rows = Math.max(1, Math.floor(image.height / definition.frameHeight));
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        frames[index.toString()] = {
          x: column * definition.frameWidth,
          y: row * definition.frameHeight,
          width: definition.frameWidth,
          height: definition.frameHeight
        };
        index += 1;
      }
    }

    return frames;
  }

  return {
    default: {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height
    }
  };
}

export function getDefaultFrame(
  frames: Record<string, SpriteRect>
): SpriteRect {
  const namedDefault = frames.default;
  if (namedDefault) {
    return namedDefault;
  }

  const firstFrame = Object.values(frames)[0];
  if (!firstFrame) {
    throw new Error("Sprite sheet does not contain any frames.");
  }

  return firstFrame;
}

export class AssetStore {
  constructor(private readonly sheets: Record<string, SpriteSheet>) {}

  getSheet(id: string): SpriteSheet {
    const sheet = this.sheets[id];
    if (!sheet) {
      throw new Error(`Asset "${id}" has not been loaded.`);
    }

    return sheet;
  }

  getFrame(id: string, frameName?: string): SpriteRect {
    const sheet = this.getSheet(id);
    if (!frameName) {
      return sheet.defaultFrame;
    }

    const frame = sheet.frames[frameName];
    if (!frame) {
      throw new Error(`Frame "${frameName}" does not exist on asset "${id}".`);
    }

    return frame;
  }
}

export async function loadAssets(
  manifest: AssetManifest = {},
  loader: ImageLoader = loadImage
): Promise<AssetStore> {
  const entries = await Promise.all(
    Object.entries(manifest).map(async ([id, definition]) => {
      const image = await loader(definition.src);
      const frames = buildFrameMap(definition, image);

      return [
        id,
        {
          image,
          frames,
          defaultFrame: getDefaultFrame(frames)
        }
      ] as const;
    })
  );

  return new AssetStore(Object.fromEntries(entries));
}

export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image "${source}".`));
    image.src = source;
  });
}

