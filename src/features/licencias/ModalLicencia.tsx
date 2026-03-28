import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shuffle, Save, X } from "lucide-react";
import { useLicenciasStore } from "@/store/licencias-store";
import { generarClave } from "@/lib/generar-clave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Licencia, Permisos } from "@/types/licencia";
import { DEFAULT_PERMISOS, PERMISOS_LABELS } from "@/types/licencia";

interface ModalLicenciaProps {
  open: boolean;
  onClose: () => void;
  licencia: Licencia | null;
}

export function ModalLicencia({ open, onClose, licencia }: ModalLicenciaProps) {
  const { crearLicencia, actualizarLicencia } = useLicenciasStore();
  const isEditing = !!licencia;

  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState("");
  const [activa, setActiva] = useState(true);
  const [permisos, setPermisos] = useState<Permisos>({ ...DEFAULT_PERMISOS });
  const [venceEn, setVenceEn] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (licencia) {
        setNombre(licencia.nombre);
        setClave(licencia.clave);
        setActiva(licencia.activa);
        setPermisos({ ...licencia.permisos });
        setVenceEn(licencia.vence_en ?? "");
      } else {
        setNombre("");
        setClave("");
        setActiva(true);
        setPermisos({ ...DEFAULT_PERMISOS });
        setVenceEn("");
      }
    }
  }, [open, licencia]);

  const handleGenerar = () => {
    setClave(generarClave());
  };

  const handlePermisoChange = (key: keyof Permisos, value: boolean) => {
    setPermisos((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!isEditing && !clave.trim()) {
      toast.error("La clave es obligatoria. Usa el botón Generar.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await actualizarLicencia(licencia.id, {
          nombre: nombre.trim(),
          activa,
          permisos,
          vence_en: venceEn || null,
        });
        toast.success("Licencia actualizada correctamente");
      } else {
        await crearLicencia({
          nombre: nombre.trim(),
          clave: clave.toUpperCase(),
          activa,
          permisos,
          vence_en: venceEn || null,
        });
        toast.success("Licencia creada correctamente");
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar licencia" : "Nueva licencia"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Empresa ABC — Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Clave */}
          <div className="space-y-2">
            <Label htmlFor="clave">Clave de licencia</Label>
            <div className="flex gap-2">
              <Input
                id="clave"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={clave}
                onChange={(e) => setClave(e.target.value.toUpperCase())}
                disabled={isEditing}
                className="font-mono"
              />
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerar}
                >
                  <Shuffle className="h-4 w-4" />
                  Generar
                </Button>
              )}
            </div>
          </div>

          {/* Activa */}
          <div className="flex items-center justify-between">
            <Label htmlFor="activa">Estado de la licencia</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activa ? "Activa" : "Inactiva"}
              </span>
              <Switch
                id="activa"
                checked={activa}
                onCheckedChange={setActiva}
              />
            </div>
          </div>

          <Separator />

          {/* Permisos */}
          <div className="space-y-3">
            <Label>Permisos</Label>
            {(Object.keys(PERMISOS_LABELS) as (keyof Permisos)[]).map(
              (key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label
                    htmlFor={`permiso-${key}`}
                    className="font-normal text-sm"
                  >
                    {PERMISOS_LABELS[key]}
                  </Label>
                  <Switch
                    id={`permiso-${key}`}
                    checked={permisos[key]}
                    onCheckedChange={(v) => handlePermisoChange(key, v)}
                  />
                </div>
              )
            )}
          </div>

          <Separator />

          {/* Fecha de vencimiento */}
          <div className="space-y-2">
            <Label htmlFor="vence_en">
              Fecha de vencimiento{" "}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Input
              id="vence_en"
              type="date"
              value={venceEn}
              onChange={(e) => setVenceEn(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={saving}>
              {saving ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
