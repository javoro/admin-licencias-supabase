import { toast } from "sonner";
import { X, Copy, Check, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Licencia, Permisos } from "@/types/licencia";
import { PERMISOS_LABELS } from "@/types/licencia";

interface DetalleLicenciaProps {
  licencia: Licencia;
  onClose: () => void;
}

export function DetalleLicencia({ licencia, onClose }: DetalleLicenciaProps) {
  const handleCopiarClave = async () => {
    try {
      await navigator.clipboard.writeText(licencia.clave);
      toast.success("Clave copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar la clave");
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Sin vencimiento";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Detalle de licencia</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* UUID */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">ID</p>
          <p className="text-xs font-mono break-all">{licencia.id}</p>
        </div>

        {/* Clave */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Clave</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono font-bold">{licencia.clave}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopiarClave}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Nombre</p>
          <p className="text-sm">{licencia.nombre}</p>
        </div>

        {/* Estado */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Estado</p>
          {licencia.activa ? (
            <Badge variant="success">Activa</Badge>
          ) : (
            <Badge variant="destructive">Inactiva</Badge>
          )}
        </div>

        <Separator />

        {/* Permisos */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Permisos</p>
          <div className="space-y-2">
            {(Object.keys(PERMISOS_LABELS) as (keyof Permisos)[]).map(
              (key) => (
                <div key={key} className="flex items-center gap-2">
                  {licencia.permisos[key] ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  )}
                  <span className="text-sm">{PERMISOS_LABELS[key]}</span>
                </div>
              )
            )}
          </div>
        </div>

        <Separator />

        {/* Vencimiento */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Vencimiento</p>
          <p className="text-sm">{formatDate(licencia.vence_en)}</p>
        </div>

        {/* Fecha de creación */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Fecha de creación
          </p>
          <p className="text-sm">{formatDateTime(licencia.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
