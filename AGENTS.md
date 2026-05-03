# Codex Pixel Engine Agent Guide

Read this first when working in this repo. It is the lightweight entry point for the project skill tree.

## Project Shape

- `packages/engine` contains the reusable TypeScript game engine runtime.
- `apps/demo` contains the Electron + Vite demo game that exercises the engine.
- `build-exe.ps1` and `build-exe.bat` create Windows distributables in `release/demo`.
- `docs/skills` contains task-specific markdown guides. Load only the guide relevant to the current task.

## Skill Tree

- Testing, build checks, and when to regenerate `.exe` files: [HowToTestProject.md](docs/skills/HowToTestProject.md)
- Adding ECS component types: [HowToMakeComponents.md](docs/skills/HowToMakeComponents.md)
- Adding ECS systems and game behavior: [HowToMakeSystems.md](docs/skills/HowToMakeSystems.md)
- Renderer, sprites, and pixel-art rules: [HowToRenderPixelArt.md](docs/skills/HowToRenderPixelArt.md)
- Collision and movement behavior: [HowToChangePhysics.md](docs/skills/HowToChangePhysics.md)
- Debugging installed or portable builds: [HowToDebugPackagedExe.md](docs/skills/HowToDebugPackagedExe.md)
- Building distributable Windows `.exe` files: [HowToBuildDistributable.md](docs/skills/HowToBuildDistributable.md)
- Expanding this documentation system: [HowToAddSkillDocs.md](docs/skills/HowToAddSkillDocs.md)

## Operating Rules

- Add or update focused tests with behavior changes, especially ECS, input, collision, renderer, and packaging work.
- Prefer small, composable ECS components over large state bags.
- Keep gameplay logic in the renderer process. Keep Electron main/preload focused on shell, logging, and safe bridges.
- Preserve pixel-art rendering rules: fixed virtual resolution, nearest-neighbor scaling, and pixel-aligned sprite draws.
- Do not commit generated outputs from `dist`, `dist-electron`, `release`, `logs`, `node_modules`, or local app install folders.

