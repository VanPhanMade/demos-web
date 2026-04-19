import { BrowserWindow, app } from "electron";
import path from "node:path";

const rendererHtml = path.resolve(__dirname, "../dist/index.html");
const preloadPath = path.resolve(__dirname, "preload.js");

async function createWindow(): Promise<void> {
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

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    await window.loadURL(devServerUrl);
    window.webContents.openDevTools({ mode: "detach" });
    return;
  }

  await window.loadFile(rendererHtml);
}

app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
