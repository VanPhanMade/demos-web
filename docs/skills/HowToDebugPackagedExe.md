# How To Debug Packaged Exe

Use this when the installer, portable executable, or installed app behaves differently from dev mode.

## Log Locations

- Build/construction logs: `C:\CodexProjects\CodexProjects\Host\logs\build-exe-*.txt`
- Installer logs: `%LOCALAPPDATA%\Codex Pixel Engine Demo\logs\installer-log.txt`
- Runtime logs: `%APPDATA%\Codex Pixel Engine Demo\logs\runtime-log.txt`

## Runtime Log Milestones

The final app should log:

- Runtime log initialized.
- BrowserWindow created.
- Packaged renderer path loaded.
- Renderer boot.
- Renderer DOM constructed.
- ECS scene setup starting.
- ECS scene setup completed with entity count.
- Game started with entity count and canvas size.

If the window is blank, check whether the runtime log stops before `renderer DOM constructed`, before `ECS scene setup completed`, or at an asset-loading error.

## Common Packaged App Failures

- Absolute asset paths such as `/assets/...` fail under `file://`.
- Missing preload bridge errors appear in `runtime-log.txt`.
- Renderer exceptions are captured through preload and written to `runtime-log.txt`.
- Installer behavior is captured in `installer-log.txt`.

## Verification Path

After packaging-sensitive changes:

```powershell
.\build-exe.bat -SkipTypecheck
```

Then run the portable `.exe` from `release/demo` and inspect `%APPDATA%\Codex Pixel Engine Demo\logs\runtime-log.txt`.

