import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X as XIcon,
  Link2,
} from "lucide-react";
import { useLicenciasStore } from "@/store/licencias-store";
import { useAplicacionesStore } from "@/store/aplicaciones-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectOption } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ModalLicencia } from "./ModalLicencia";
import { DetalleLicencia } from "./DetalleLicencia";
import type { Licencia, Permisos } from "@/types/licencia";
import { PERMISOS_LABELS } from "@/types/licencia";

export function LicenciasPage() {
  const {
    loading,
    filtro,
    estadoFiltro,
    aplicacionFiltro,
    licenciaSeleccionada,
    fetchLicencias,
    eliminarLicencia,
    setFiltro,
    setEstadoFiltro,
    setAplicacionFiltro,
    setLicenciaSeleccionada,
    getLicenciasFiltradas,
  } = useLicenciasStore();

  const { aplicaciones, cargarAplicaciones } = useAplicacionesStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [licenciaEditar, setLicenciaEditar] = useState<Licencia | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Licencia | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLicencias().catch((err) => {
      toast.error("Error al cargar licencias: " + err.message);
    });
    cargarAplicaciones().catch(() => {});
  }, [fetchLicencias, cargarAplicaciones]);

  const licenciasFiltradas = getLicenciasFiltradas();

  const handleEditar = (lic: Licencia, e: React.MouseEvent) => {
    e.stopPropagation();
    setLicenciaEditar(lic);
    setModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await eliminarLicencia(deleteDialog.id);
      toast.success("Licencia eliminada correctamente");
      setDeleteDialog(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error("Error al eliminar: " + message);
    } finally {
      setDeleting(false);
    }
  };

  const handleNueva = () => {
    setLicenciaEditar(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setLicenciaEditar(null);
  };

  const handleRowClick = (lic: Licencia) => {
    setLicenciaSeleccionada(
      licenciaSeleccionada?.id === lic.id ? null : lic
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Sin vencimiento";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCreatedAt = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const permisosActivos = (permisos: Permisos) => {
    return (Object.keys(permisos) as (keyof Permisos)[]).filter(
      (key) => permisos[key]
    );
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por clave o nombre..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={aplicacionFiltro}
            onValueChange={setAplicacionFiltro}
            className="w-48"
          >
            <SelectOption value="todas">Todas las apps</SelectOption>
            {aplicaciones.map((app) => (
              <SelectOption key={app.id} value={app.id}>
                {app.nombre}
              </SelectOption>
            ))}
          </Select>

          <Select
            value={estadoFiltro}
            onValueChange={(v) =>
              setEstadoFiltro(v as "todas" | "activas" | "inactivas")
            }
            className="w-36"
          >
            <SelectOption value="todas">Todas</SelectOption>
            <SelectOption value="activas">Activas</SelectOption>
            <SelectOption value="inactivas">Inactivas</SelectOption>
          </Select>

          <Button onClick={handleNueva} className="ml-auto shrink-0">
            <Plus className="h-4 w-4" />
            Nueva licencia
          </Button>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto px-6 py-2">
          {loading ? (
            <div className="space-y-3 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : licenciasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-lg">No se encontraron licencias</p>
              <p className="text-sm mt-1">
                {filtro || estadoFiltro !== "todas" || aplicacionFiltro !== "todas"
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Crea una nueva licencia para empezar"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clave</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Aplicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenciasFiltradas.map((lic) => (
                  <TableRow
                    key={lic.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(lic)}
                    data-state={
                      licenciaSeleccionada?.id === lic.id
                        ? "selected"
                        : undefined
                    }
                  >
                    <TableCell className="font-mono text-xs">
                      {lic.clave}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {lic.nombre}
                    </TableCell>
                    <TableCell>
                      {lic.aplicacion ? (
                        <Badge variant="outline" className="text-xs">
                          {lic.aplicacion.nombre}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lic.activa ? (
                        <Badge variant="success">Activa</Badge>
                      ) : (
                        <Badge variant="destructive">Inactiva</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {lic.machine_id ? (
                        <Badge variant="default" className="gap-1">
                          <Link2 className="h-3 w-3" />
                          Vinculado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Sin vincular</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {permisosActivos(lic.permisos).map((key) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {PERMISOS_LABELS[key]}
                          </Badge>
                        ))}
                        {permisosActivos(lic.permisos).length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            Ninguno
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(lic.vence_en)}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatCreatedAt(lic.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditar(lic, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog(lic);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Panel de detalle */}
      {licenciaSeleccionada && (
        <DetalleLicencia
          licencia={licenciaSeleccionada}
          onClose={() => setLicenciaSeleccionada(null)}
        />
      )}

      {/* Modal crear/editar */}
      <ModalLicencia
        open={modalOpen}
        onClose={handleModalClose}
        licencia={licenciaEditar}
      />

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <DialogContent onClose={() => setDeleteDialog(null)}>
          <DialogHeader>
            <DialogTitle>Eliminar licencia</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la licencia{" "}
              <span className="font-mono font-bold">
                {deleteDialog?.clave}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              disabled={deleting}
            >
              <XIcon className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminar}
              disabled={deleting}
            >
              {deleting ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
