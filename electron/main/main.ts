import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = path.join(__dirname, "../../resources/icon.png");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    icon: nativeImage.createFromPath(iconPath),
    backgroundColor: "#09090b",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Solo verificar actualizaciones en producción
  if (!process.env.VITE_DEV_SERVER_URL) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

autoUpdater.on("update-available", (info) => {
  mainWindow?.webContents.send("update-available", info);
});

autoUpdater.on("update-downloaded", (info) => {
  mainWindow?.webContents.send("update-downloaded", info);
});

autoUpdater.on("error", (err) => {
  mainWindow?.webContents.send("update-error", err.message);
});

ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("window-minimize", () => {
  mainWindow?.minimize();
});

ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on("window-close", () => {
  mainWindow?.close();
});
