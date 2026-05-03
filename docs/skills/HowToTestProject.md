# How To Test Project

Use this when changing engine behavior, demo game behavior, Electron packaging, logging, or distributable builds.

## Fast Checks

Run from `C:\CodexProjects\CodexProjects\Host`:

```powershell
npm run typecheck
npm test
npm run build
```

Vitest and Vite may need permission to spawn `esbuild` in sandboxed sessions. If `spawn EPERM` appears, rerun the same command with elevated execution.

## Behavior Test Expectations

- Engine changes belong under `packages/engine/src/**/*.test.ts`.
- Demo game behavior changes belong under `apps/demo/src/**/*.test.ts`.
- Any bug that can be reproduced as pure logic should get a unit test before or alongside the fix.
- Do not rely only on manual Electron testing when a system, component, input rule, or collision rule can be tested directly.

## Packaging Checks

Use this after changes that affect packaged runtime paths, Electron main/preload code, installer behavior, or logs:

```powershell
.\build-exe.bat -SkipTypecheck
```

The build script writes construction logs to `logs/build-exe-*.txt`.

## Current Test Coverage Anchors

- Engine ECS, input, renderer, and game loop tests live in `packages/engine/src`.
- Demo collision and movement tests live in `apps/demo/src/game/demo-game.test.ts`.

