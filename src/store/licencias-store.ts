import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Licencia, LicenciaInsert, LicenciaUpdate } from "@/types/licencia";

function RLS_HINT(msg: string): string {
  return `${msg}\n\n→ Solución: en el panel de Supabase ve a Table Editor → licencias → Policies y añade políticas para INSERT, UPDATE y DELETE con condición "true".`;
}

type EstadoFiltro = "todas" | "activas" | "inactivas";

interface LicenciasState {
  licencias: Licencia[];
  loading: boolean;
  error: string | null;
  filtro: string;
  estadoFiltro: EstadoFiltro;
  aplicacionFiltro: string;
  licenciaSeleccionada: Licencia | null;

  fetchLicencias: () => Promise<void>;
  crearLicencia: (data: LicenciaInsert) => Promise<void>;
  actualizarLicencia: (id: string, data: LicenciaUpdate) => Promise<void>;
  eliminarLicencia: (id: string) => Promise<void>;
  desvincularMaquina: (id: string) => Promise<void>;
  verificarClaveExiste: (clave: string) => Promise<boolean>;
  setFiltro: (filtro: string) => void;
  setEstadoFiltro: (estado: EstadoFiltro) => void;
  setAplicacionFiltro: (appId: string) => void;
  setLicenciaSeleccionada: (licencia: Licencia | null) => void;
  getLicenciasFiltradas: () => Licencia[];
}

export const useLicenciasStore = create<LicenciasState>((set, get) => ({
  licencias: [],
  loading: false,
  error: null,
  filtro: "",
  estadoFiltro: "todas",
  aplicacionFiltro: "todas",
  licenciaSeleccionada: null,

  fetchLicencias: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("licencias")
      .select("*, aplicacion:aplicaciones(id, nombre, slug)")
      .order("created_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      throw new Error(error.message);
    }

    const licencias = (data || []).map((row: Record<string, unknown>) => ({
      ...row,
      aplicacion: row.aplicacion ?? undefined,
    })) as Licencia[];

    set({ licencias, loading: false });
  },

  crearLicencia: async (data: LicenciaInsert) => {
    const existe = await get().verificarClaveExiste(data.clave);
    if (existe) {
      throw new Error("Ya existe una licencia con esa clave");
    }

    const { data: inserted, error } = await supabase
      .from("licencias")
      .insert({
        clave: data.clave.toUpperCase(),
        nombre: data.nombre,
        activa: data.activa,
        permisos: data.permisos,
        vence_en: data.vence_en || null,
        aplicacion_id: data.aplicacion_id || null,
      })
      .select("id");

    if (error) {
      throw new Error(RLS_HINT(error.message));
    }
    if (!inserted?.length) {
      throw new Error(RLS_HINT("La inserción no fue permitida por las políticas de seguridad (RLS) de Supabase."));
    }
    await get().fetchLicencias();
  },

  actualizarLicencia: async (id: string, data: LicenciaUpdate) => {
    const updatePayload: Record<string, unknown> = {};
    if (data.nombre !== undefined) updatePayload.nombre = data.nombre;
    if (data.activa !== undefined) updatePayload.activa = data.activa;
    if (data.permisos !== undefined) updatePayload.permisos = data.permisos;
    if (data.vence_en !== undefined) updatePayload.vence_en = data.vence_en || null;
    if (data.aplicacion_id !== undefined) updatePayload.aplicacion_id = data.aplicacion_id || null;

    const { data: updated, error } = await supabase
      .from("licencias")
      .update(updatePayload)
      .eq("id", id)
      .select("id");

    if (error) {
      throw new Error(RLS_HINT(error.message));
    }
    if (!updated?.length) {
      throw new Error(RLS_HINT("La actualización no fue aplicada. Verifica las políticas RLS de Supabase."));
    }

    const { licenciaSeleccionada } = get();
    if (licenciaSeleccionada?.id === id) {
      const { data: refreshed } = await supabase
        .from("licencias")
        .select("*, aplicacion:aplicaciones(id, nombre, slug)")
        .eq("id", id)
        .single();
      if (refreshed) {
        set({ licenciaSeleccionada: refreshed as unknown as Licencia });
      }
    }

    await get().fetchLicencias();
  },

  eliminarLicencia: async (id: string) => {
    const { data: deleted, error } = await supabase
      .from("licencias")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      throw new Error(RLS_HINT(error.message));
    }
    if (!deleted?.length) {
      throw new Error(RLS_HINT("La eliminación no fue permitida por las políticas de seguridad (RLS) de Supabase."));
    }

    const { licenciaSeleccionada } = get();
    if (licenciaSeleccionada?.id === id) {
      set({ licenciaSeleccionada: null });
    }

    await get().fetchLicencias();
  },

  desvincularMaquina: async (id: string) => {
    const { data: updated, error } = await supabase
      .from("licencias")
      .update({ machine_id: null })
      .eq("id", id)
      .select("id");

    if (error) {
      throw new Error(RLS_HINT(error.message));
    }
    if (!updated?.length) {
      throw new Error(RLS_HINT("La desvinculación no fue aplicada. Verifica las políticas RLS de Supabase."));
    }

    const { licenciaSeleccionada } = get();
    if (licenciaSeleccionada?.id === id) {
      set({ licenciaSeleccionada: { ...licenciaSeleccionada, machine_id: null } });
    }

    await get().fetchLicencias();
  },

  verificarClaveExiste: async (clave: string) => {
    const { count } = await supabase
      .from("licencias")
      .select("*", { count: "exact", head: true })
      .eq("clave", clave.toUpperCase());
    return (count ?? 0) > 0;
  },

  setFiltro: (filtro: string) => set({ filtro }),
  setEstadoFiltro: (estadoFiltro: EstadoFiltro) => set({ estadoFiltro }),
  setAplicacionFiltro: (aplicacionFiltro: string) => set({ aplicacionFiltro }),
  setLicenciaSeleccionada: (licencia: Licencia | null) =>
    set({ licenciaSeleccionada: licencia }),

  getLicenciasFiltradas: () => {
    const { licencias, filtro, estadoFiltro, aplicacionFiltro } = get();
    let resultado = licencias;

    if (estadoFiltro === "activas") {
      resultado = resultado.filter((l) => l.activa);
    } else if (estadoFiltro === "inactivas") {
      resultado = resultado.filter((l) => !l.activa);
    }

    if (aplicacionFiltro !== "todas") {
      resultado = resultado.filter((l) => l.aplicacion_id === aplicacionFiltro);
    }

    if (filtro.trim()) {
      const term = filtro.toLowerCase();
      resultado = resultado.filter(
        (l) =>
          l.clave.toLowerCase().includes(term) ||
          l.nombre.toLowerCase().includes(term)
      );
    }

    return resultado;
  },
}));
