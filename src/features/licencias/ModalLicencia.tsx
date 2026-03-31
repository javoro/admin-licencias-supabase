import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shuffle, Save, X, Unlink } from "lucide-react";
import { useLicenciasStore } from "@/store/licencias-store";
import { useAplicacionesStore } from "@/store/aplicaciones-store";
import { generarClave } from "@/lib/generar-clave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectOption } from "@/components/ui/select";
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
  const { crearLicencia, actualizarLicencia, desvincularMaquina } = useLicenciasStore();
  const { aplicaciones, cargarAplicaciones } = useAplicacionesStore();
  const isEditing = !!licencia;

  const appsActivas = aplicaciones.filter((a) => a.activa);

  const [nombre, setNombre] = useState("");
  const [clave, setClave] = useState("");
  const [activa, setActiva] = useState(true);
  const [permisos, setPermisos] = useState<Permisos>({ ...DEFAULT_PERMISOS });
  const [venceEn, setVenceEn] = useState("");
  const [aplicacionId, setAplicacionId] = useState("");
  const [saving, setSaving] = useState(false);
  const [unlinkConfirm, setUnlinkConfirm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    if (open) {
      cargarAplicaciones().catch(() => {});
    }
  }, [open, cargarAplicaciones]);

  useEffect(() => {
    if (open) {
      setUnlinkConfirm(false);
      if (licencia) {
        setNombre(licencia.nombre);
        setClave(licencia.clave);
        setActiva(licencia.activa);
        setPermisos({ ...licencia.permisos });
        setVenceEn(licencia.vence_en ?? "");
        setAplicacionId(licencia.aplicacion_id ?? "");
      } else {
        setNombre("");
        setClave("");
        setActiva(true);
        setPermisos({ ...DEFAULT_PERMISOS });
        setVenceEn("");
        setAplicacionId(appsActivas.length === 1 ? appsActivas[0].id : "");
      }
    }
  }, [open, licencia, appsActivas.length]);

  const handleGenerar = () => {
    setClave(generarClave());
  };

  const handlePermisoChange = (key: keyof Permisos, value: boolean) => {
    setPermisos((prev) => ({ ...prev, [key]: value }));
  };

  const handleDesvincular = async () => {
    if (!licencia) return;
    setUnlinking(true);
    try {
      await desvincularMaquina(licencia.id);
      toast.success("Licencia desvinculada correctamente");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setUnlinking(false);
    }
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
    if (!aplicacionId) {
      toast.error("Debes seleccionar una aplicación");
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
          aplicacion_id: aplicacionId || null,
        });
        toast.success("Licencia actualizada correctamente");
      } else {
        await crearLicencia({
          nombre: nombre.trim(),
          clave: clave.toUpperCase(),
          activa,
          permisos,
          vence_en: venceEn || null,
          aplicacion_id: aplicacionId || null,
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
          {/* Aplicación */}
          <div className="space-y-2">
            <Label htmlFor="aplicacion">Aplicación</Label>
            <Select
              value={aplicacionId}
              onValueChange={setAplicacionId}
              className="w-full"
            >
              <SelectOption value="">Seleccionar aplicación...</SelectOption>
              {appsActivas.map((app) => (
                <SelectOption key={app.id} value={app.id}>
                  {app.nombre}
                </SelectOption>
              ))}
            </Select>
          </div>

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

          {/* Desvincular equipo */}
          {isEditing && licencia?.machine_id && (
            <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Equipo vinculado</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {licencia.machine_id}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUnlinkConfirm(true)}
                  disabled={saving || unlinking || unlinkConfirm}
                >
                  <Unlink className="h-4 w-4" />
                  Desvincular
                </Button>
              </div>
              {unlinkConfirm && (
                <div className="rounded border border-yellow-500/30 bg-yellow-500/10 p-2 space-y-2">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    ¿Desvincular esta licencia de su equipo actual? El próximo equipo que la active quedará registrado.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                      onClick={handleDesvincular}
                      disabled={unlinking}
                    >
                      {unlinking ? (
                        <span className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      ) : (
                        <Unlink className="h-3 w-3" />
                      )}
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => setUnlinkConfirm(false)}
                      disabled={unlinking}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

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
