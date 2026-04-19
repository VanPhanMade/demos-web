import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("codexHost", {
  platform: process.platform
});

