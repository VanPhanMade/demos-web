import { BrowserWindow, app, ipcMain } from "electron";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const rendererHtml = path.resolve(__dirname, "../dist/index.html");
const preloadPath = path.resolve(__dirname, "preload.js");
let runtimeLogPath = "";

type LogLevel = "debug" | "info" | "warn" | "error";

function serialize(value: unknown): string {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}\n${value.stack ?? ""}`;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function writeRuntimeLog(
  level: LogLevel,
  message: string,
  details?: unknown
): void {
  if (!runtimeLogPath) {
    return;
  }

  const suffix = details === undefined ? "" : ` ${serialize(details)}`;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${suffix}${os.EOL}`;

  try {
    fs.appendFileSync(runtimeLogPath, line, "utf8");
  } catch (error) {
    console.error("Failed to write runtime log", error);
  }
}

function initializeRuntimeLog(): void {
  const logDirectory = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(logDirectory, { recursive: true });
  runtimeLogPath = path.join(logDirectory, "runtime-log.txt");

  writeRuntimeLog("info", "runtime log initialized", {
    logPath: runtimeLogPath,
    appVersion: app.getVersion(),
    packaged: app.isPackaged,
    userData: app.getPath("userData"),
    resourcesPath: process.resourcesPath,
    appPath: app.getAppPath()
  });
}

ipcMain.on(
  "codex-log",
  (
    _event,
    payload: {
      level?: LogLevel;
      message?: string;
      details?: unknown;
    }
  ) => {
    writeRuntimeLog(
      payload.level ?? "info",
      `renderer: ${payload.message ?? "message"}`,
      payload.details
    );
  }
);

async function createWindow(): Promise<void> {
  writeRuntimeLog("info", "creating BrowserWindow");

  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 400,
    backgroundColor: "#0b1220",
    webPreferences: {
      preload: preloadPath
    }
  });

  window.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    writeRuntimeLog("info", "renderer console message", {
      level,
      message,
      line,
      sourceId
    });
  });

  window.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      writeRuntimeLog("error", "renderer failed to load", {
        errorCode,
        errorDescription,
        validatedURL
      });
    }
  );

  window.webContents.on("did-finish-load", () => {
    writeRuntimeLog("info", "renderer finished loading", {
      url: window.webContents.getURL()
    });
  });

  window.webContents.on("render-process-gone", (_event, details) => {
    writeRuntimeLog("error", "renderer process gone", details);
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    writeRuntimeLog("info", "loading dev server", { devServerUrl });
    await window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  writeRuntimeLog("info", "loading packaged renderer", { rendererHtml });
  await window.loadFile(rendererHtml);
}

app.whenReady().then(async () => {
  initializeRuntimeLog();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

process.on("uncaughtException", (error) => {
  writeRuntimeLog("error", "uncaught exception", error);
});

process.on("unhandledRejection", (reason) => {
  writeRuntimeLog("error", "unhandled rejection", reason);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
