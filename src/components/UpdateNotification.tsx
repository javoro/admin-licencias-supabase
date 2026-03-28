import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type UpdateState = "idle" | "available" | "downloaded" | "error";

export function UpdateNotification() {
  const [state, setState] = useState<UpdateState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onUpdateAvailable(() => setState("available"));
    api.onUpdateDownloaded(() => setState("downloaded"));
    api.onUpdateError((msg) => {
      setErrorMsg(msg);
      setState("error");
    });
  }, []);

  if (state === "idle") return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs border-b border-border bg-muted/50">
      {state === "available" && (
        <>
          <Download className="h-3 w-3 text-blue-400 shrink-0" />
          <span className="text-muted-foreground">
            Nueva versión disponible — descargando en segundo plano…
          </span>
        </>
      )}

      {state === "downloaded" && (
        <>
          <RefreshCw className="h-3 w-3 text-green-400 shrink-0" />
          <span className="text-muted-foreground flex-1">
            Actualización lista para instalar.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs px-2"
            onClick={() => window.electronAPI?.installUpdate()}
          >
            Reiniciar e instalar
          </Button>
        </>
      )}

      {state === "error" && (
        <span className="text-red-400">
          Error al verificar actualizaciones: {errorMsg}
        </span>
      )}
    </div>
  );
}
