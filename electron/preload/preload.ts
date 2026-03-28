import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  installUpdate: () => ipcRenderer.send("install-update"),
  onUpdateAvailable: (cb: (info: unknown) => void) =>
    ipcRenderer.on("update-available", (_e, info) => cb(info)),
  onUpdateDownloaded: (cb: (info: unknown) => void) =>
    ipcRenderer.on("update-downloaded", (_e, info) => cb(info)),
  onUpdateError: (cb: (msg: string) => void) =>
    ipcRenderer.on("update-error", (_e, msg) => cb(msg)),
});
