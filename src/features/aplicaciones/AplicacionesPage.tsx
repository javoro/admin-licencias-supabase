import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, KeyRound } from "lucide-react";
import { useAplicacionesStore } from "@/store/aplicaciones-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ModalAplicacion } from "./ModalAplicacion";
import type { Aplicacion } from "@/types/licencia";

export function AplicacionesPage() {
  const {
    aplicaciones,
    loading,
    licenciasPorApp,
    cargarAplicaciones,
    cargarConteoLicencias,
  } = useAplicacionesStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [appEditar, setAppEditar] = useState<Aplicacion | null>(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarAplicaciones().catch((err) => {
      toast.error("Error al cargar aplicaciones: " + err.message);
    });
    cargarConteoLicencias().catch(() => {});
  }, [cargarAplicaciones, cargarConteoLicencias]);

  const appsFiltradas = aplicaciones.filter((app) => {
    if (!filtro.trim()) return true;
    const term = filtro.toLowerCase();
    return (
      app.nombre.toLowerCase().includes(term) ||
      app.slug.toLowerCase().includes(term)
    );
  });

  const handleEditar = (app: Aplicacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppEditar(app);
    setModalOpen(true);
  };

  const handleNueva = () => {
    setAppEditar(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setAppEditar(null);
  };

  const formatCreatedAt = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o slug..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={handleNueva} className="ml-auto">
          <Plus className="h-4 w-4" />
          Nueva aplicación
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-2">
        {loading ? (
          <div className="space-y-3 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : appsFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">No se encontraron aplicaciones</p>
            <p className="text-sm mt-1">
              {filtro
                ? "Intenta cambiar el filtro de búsqueda"
                : "Crea una nueva aplicación para empezar"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Licencias</TableHead>
                <TableHead>Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appsFiltradas.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.nombre}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {app.slug}
                  </TableCell>
                  <TableCell>
                    {app.activa ? (
                      <Badge variant="success">Activa</Badge>
                    ) : (
                      <Badge variant="destructive">Inactiva</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        {licenciasPorApp[app.id] ?? 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCreatedAt(app.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleEditar(app, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ModalAplicacion
        open={modalOpen}
        onClose={handleModalClose}
        aplicacion={appEditar}
      />
    </div>
  );
}
