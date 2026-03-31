import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { useAplicacionesStore } from "@/store/aplicaciones-store";
import { generarSlug } from "@/lib/generar-slug";
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
import type { Aplicacion } from "@/types/licencia";

interface ModalAplicacionProps {
  open: boolean;
  onClose: () => void;
  aplicacion: Aplicacion | null;
}

const SLUG_REGEX = /^[a-z0-9-]+$/;

export function ModalAplicacion({ open, onClose, aplicacion }: ModalAplicacionProps) {
  const { crearAplicacion, actualizarAplicacion, verificarNombreExiste, verificarSlugExiste } =
    useAplicacionesStore();
  const isEditing = !!aplicacion;

  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [activa, setActiva] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setSlugTouched(false);
      if (aplicacion) {
        setNombre(aplicacion.nombre);
        setSlug(aplicacion.slug);
        setActiva(aplicacion.activa);
      } else {
        setNombre("");
        setSlug("");
        setActiva(true);
      }
    }
  }, [open, aplicacion]);

  const handleNombreChange = (value: string) => {
    setNombre(value);
    if (!isEditing && !slugTouched) {
      setSlug(generarSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!slug.trim()) {
      toast.error("El slug es obligatorio");
      return;
    }
    if (!SLUG_REGEX.test(slug)) {
      toast.error("El slug solo puede contener letras minúsculas, números y guiones");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const nombreDuplicado = await verificarNombreExiste(nombre.trim(), aplicacion.id);
        if (nombreDuplicado) {
          toast.error("Ya existe otra aplicación con ese nombre");
          setSaving(false);
          return;
        }
        await actualizarAplicacion(aplicacion.id, {
          nombre: nombre.trim(),
          activa,
        });
        toast.success("Aplicación actualizada correctamente");
      } else {
        const nombreDuplicado = await verificarNombreExiste(nombre.trim());
        if (nombreDuplicado) {
          toast.error("Ya existe una aplicación con ese nombre");
          setSaving(false);
          return;
        }
        const slugDuplicado = await verificarSlugExiste(slug);
        if (slugDuplicado) {
          toast.error("Ya existe una aplicación con ese slug");
          setSaving(false);
          return;
        }
        await crearAplicacion({
          nombre: nombre.trim(),
          slug,
          activa,
        });
        toast.success("Aplicación creada correctamente");
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
      <DialogContent onClose={onClose} className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar aplicación" : "Nueva aplicación"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-nombre">Nombre</Label>
            <Input
              id="app-nombre"
              placeholder="Callbell Tracker PRO"
              value={nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="app-slug">Slug</Label>
            <Input
              id="app-slug"
              placeholder="callbell-tracker-pro"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={isEditing}
              className="font-mono"
            />
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Identificador único. Solo letras minúsculas, números y guiones.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="app-activa">Estado</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activa ? "Activa" : "Inactiva"}
              </span>
              <Switch
                id="app-activa"
                checked={activa}
                onCheckedChange={setActiva}
              />
            </div>
          </div>

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
