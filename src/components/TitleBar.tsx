import { Minus, Square, X } from "lucide-react";
import iconUrl from "/icon.png";

export function TitleBar() {
  const minimize = () => window.electronAPI?.minimize();
  const maximize = () => window.electronAPI?.maximize();
  const close = () => window.electronAPI?.close();

  return (
    <div className="flex h-8 items-center justify-between border-b border-border bg-background select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 px-3">
        <img src={iconUrl} alt="" className="h-4 w-4" />
        <span className="text-xs font-semibold tracking-wide text-muted-foreground">
          ADMINISTRADOR DE LICENCIAS
        </span>
      </div>

      <div
        className="flex h-full"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={minimize}
          className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={maximize}
          className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <Square className="h-3 w-3" />
        </button>
        <button
          onClick={close}
          className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-red-600 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
