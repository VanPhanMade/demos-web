import { contextBridge, ipcRenderer } from "electron";

type LogLevel = "debug" | "info" | "warn" | "error";

function serializeReason(reason: unknown): unknown {
  if (reason instanceof Error) {
    return {
      name: reason.name,
      message: reason.message,
      stack: reason.stack
    };
  }

  return reason;
}

function log(level: LogLevel, message: string, details?: unknown): void {
  ipcRenderer.send("codex-log", {
    level,
    message,
    details: serializeReason(details)
  });
}

contextBridge.exposeInMainWorld("codexHost", {
  platform: process.platform,
  log
});

window.addEventListener("error", (event) => {
  log("error", "renderer window error", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: serializeReason(event.error)
  });
});

window.addEventListener("unhandledrejection", (event) => {
  log("error", "renderer unhandled rejection", serializeReason(event.reason));
});
