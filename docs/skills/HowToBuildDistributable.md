# How To Build Distributable

Use this when producing or changing Windows `.exe` builds.

## Main Command

Run from `C:\CodexProjects\CodexProjects\Host`:

```powershell
.\build-exe.ps1
```

Command Prompt or double-click path:

```bat
build-exe.bat
```

## Useful Flags

```powershell
.\build-exe.ps1 -SkipTypecheck
.\build-exe.ps1 -SkipInstall
```

Use `-SkipTypecheck` only after a known-good typecheck.

## Outputs

Generated files go to:

```text
release/demo/
```

Expected `.exe` outputs:

- `Codex Pixel Engine Demo-0.1.0-setup.exe`
- `Codex Pixel Engine Demo-0.1.0-portable.exe`

## Packaging Config

Electron Builder config lives in:

```text
apps/demo/electron-builder.json
```

The current local builds are unsigned. Windows may show trust warnings until a signing certificate is added.

