/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    installUpdate: () => void;
    onUpdateAvailable: (cb: (info: unknown) => void) => void;
    onUpdateDownloaded: (cb: (info: unknown) => void) => void;
    onUpdateError: (cb: (msg: string) => void) => void;
  };
}
