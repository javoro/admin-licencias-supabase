import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Licencia, LicenciaInsert, LicenciaUpdate } from "@/types/licencia";

type EstadoFiltro = "todas" | "activas" | "inactivas";

interface LicenciasState {
  licencias: Licencia[];
  loading: boolean;
  error: string | null;
  filtro: string;
  estadoFiltro: EstadoFiltro;
  licenciaSeleccionada: Licencia | null;

  fetchLicencias: () => Promise<void>;
  crearLicencia: (data: LicenciaInsert) => Promise<void>;
  actualizarLicencia: (id: string, data: LicenciaUpdate) => Promise<void>;
  eliminarLicencia: (id: string) => Promise<void>;
  verificarClaveExiste: (clave: string) => Promise<boolean>;
  setFiltro: (filtro: string) => void;
  setEstadoFiltro: (estado: EstadoFiltro) => void;
  setLicenciaSeleccionada: (licencia: Licencia | null) => void;
  getLicenciasFiltradas: () => Licencia[];
}

export const useLicenciasStore = create<LicenciasState>((set, get) => ({
  licencias: [],
  loading: false,
  error: null,
  filtro: "",
  estadoFiltro: "todas",
  licenciaSeleccionada: null,

  fetchLicencias: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("licencias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      throw new Error(error.message);
    }
    set({ licencias: data as Licencia[], loading: false });
  },

  crearLicencia: async (data: LicenciaInsert) => {
    const existe = await get().verificarClaveExiste(data.clave);
    if (existe) {
      throw new Error("Ya existe una licencia con esa clave");
    }

    const { error } = await supabase.from("licencias").insert({
      clave: data.clave.toUpperCase(),
      nombre: data.nombre,
      activa: data.activa,
      permisos: data.permisos,
      vence_en: data.vence_en || null,
    });

    if (error) {
      throw new Error(error.message);
    }
    await get().fetchLicencias();
  },

  actualizarLicencia: async (id: string, data: LicenciaUpdate) => {
    const { error } = await supabase
      .from("licencias")
      .update({
        nombre: data.nombre,
        activa: data.activa,
        permisos: data.permisos,
        vence_en: data.vence_en || null,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    const { licenciaSeleccionada } = get();
    if (licenciaSeleccionada?.id === id) {
      const { data: updated } = await supabase
        .from("licencias")
        .select("*")
        .eq("id", id)
        .single();
      if (updated) {
        set({ licenciaSeleccionada: updated as Licencia });
      }
    }

    await get().fetchLicencias();
  },

  eliminarLicencia: async (id: string) => {
    const { error } = await supabase.from("licencias").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    const { licenciaSeleccionada } = get();
    if (licenciaSeleccionada?.id === id) {
      set({ licenciaSeleccionada: null });
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
  setLicenciaSeleccionada: (licencia: Licencia | null) =>
    set({ licenciaSeleccionada: licencia }),

  getLicenciasFiltradas: () => {
    const { licencias, filtro, estadoFiltro } = get();
    let resultado = licencias;

    if (estadoFiltro === "activas") {
      resultado = resultado.filter((l) => l.activa);
    } else if (estadoFiltro === "inactivas") {
      resultado = resultado.filter((l) => !l.activa);
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
