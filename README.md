# Codex Pixel Engine Host

This workspace contains the reusable pixel-art game engine package and the Electron demo app.

For AI-assisted development, start with [AGENTS.md](AGENTS.md). The project-local skill tree lives in [docs/skills](docs/skills/README.md).

## Development

```powershell
npm install
npm run dev
```

## Build a Windows .exe

```powershell
.\build-exe.ps1
```

You can also run `build-exe.bat` from Command Prompt or by double-clicking it.

Use `.\build-exe.ps1 -SkipTypecheck` when you only want to repackage after a known-good build. Use `.\build-exe.ps1 -SkipInstall` when dependencies are already installed and you want the script to fail fast if they are missing.

The Windows artifacts are written to:

```text
release/demo/
```

The build creates both an installer and a portable executable:

- `Codex Pixel Engine Demo-0.1.0-setup.exe`
- `Codex Pixel Engine Demo-0.1.0-portable.exe`

These local builds are unsigned. For a public release, add a Windows code-signing certificate and remove the unsigned-build workaround in `apps/demo/electron-builder.json`.

## Debug Logs

The build, installer, and packaged app each write text logs:

- Build script logs: `logs/build-exe-*.txt`
- Installer logs: `%LOCALAPPDATA%\Codex Pixel Engine Demo\logs\installer-log.txt`
- App runtime logs: `%APPDATA%\Codex Pixel Engine Demo\logs\runtime-log.txt`

The runtime log records Electron load events, renderer console messages, startup errors, and ECS scene construction milestones.
