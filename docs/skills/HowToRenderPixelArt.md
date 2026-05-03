# How To Render Pixel Art

Use this when changing rendering, sprites, visual scaling, or asset paths.

## Renderer Rules

- Keep a fixed virtual resolution.
- Use Canvas2D for v1.
- Keep `imageSmoothingEnabled = false`.
- Set canvas CSS `image-rendering: pixelated`.
- Round draw positions before drawing sprites.
- Prefer integer scaling when the window is large enough.

## Asset Path Rule

Packaged Electron apps load through `file://`, so production assets must use relative paths. Do not use root-absolute paths like `/assets/sprites/foo.png` for packaged assets.

Use:

```ts
src: "./assets/sprites/demo-sprites.png"
```

## Current Renderer Locations

- Engine renderer: `packages/engine/src/renderer.ts`
- Demo asset manifest and render system: `apps/demo/src/game/demo-game.ts`
- Demo sprite sheet: `apps/demo/public/assets/sprites/demo-sprites.png`

## Test Rule

Renderer sizing and sprite frame math should be tested in engine tests. Packaged path changes should be verified with `npm run build` and, when practical, `.\build-exe.bat -SkipTypecheck`.

