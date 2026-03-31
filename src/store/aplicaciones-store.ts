import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Aplicacion } from "@/types/licencia";

function RLS_HINT(msg: string): string {
  return `${msg}\n\n→ Solución: en el panel de Supabase ve a Table Editor → aplicaciones → Policies y añade políticas para INSERT, UPDATE y DELETE con condición "true".`;
}

interface AplicacionInsert {
  nombre: string;
  slug: string;
  activa: boolean;
}

interface AplicacionUpdate {
  nombre?: string;
  activa?: boolean;
}

interface AplicacionesState {
  aplicaciones: Aplicacion[];
  loading: boolean;
  licenciasPorApp: Record<string, number>;

  cargarAplicaciones: () => Promise<void>;
  crearAplicacion: (data: AplicacionInsert) => Promise<void>;
  actualizarAplicacion: (id: string, data: AplicacionUpdate) => Promise<void>;
  verificarNombreExiste: (nombre: string, excludeId?: string) => Promise<boolean>;
  verificarSlugExiste: (slug: string, excludeId?: string) => Promise<boolean>;
  cargarConteoLicencias: () => Promise<void>;
}

export const useAplicacionesStore = create<AplicacionesState>((set, get) => ({
  aplicaciones: [],
  loading: false,
  licenciasPorApp: {},

  cargarAplicaciones: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("aplicaciones")
      .select("*")
      .order("nombre");

    if (error) {
      set({ loading: false });
      throw new Error(error.message);
    }
    set({ aplicaciones: data as Aplicacion[], loading: false });
  },

  crearAplicacion: async (data: AplicacionInsert) => {
    const { data: inserted, error } = await supabase
      .from("aplicaciones")
      .insert({
        nombre: data.nombre,
        slug: data.slug,
        activa: data.activa,
      })
      .select("id");

    if (error) {
      throw new Error(RLS_HINT(error.message));
    }
    if (!inserted?.length) {
      throw new Error(RLS_HINT("La inserción no fue permitida por las políticas de seguridad (RLS) de Supabase."));
    }
    await get().cargarAplicaciones();
    await get().cargarConteoLicencias();
  },

  actualizarAplicacion: async (id: string, data: AplicacionUpdate) => {
    const { data: updated, error } = await supabase
      .from("aplicaciones")
      .update(data)
      .eq("id", id)
      .select("id");

    if (error) {
      throw new Error(RLS_HINT(error.message));
    }
    if (!updated?.length) {
      throw new Error(RLS_HINT("La actualización no fue aplicada. Verifica las políticas RLS de Supabase."));
    }
    await get().cargarAplicaciones();
  },

  verificarNombreExiste: async (nombre: string, excludeId?: string) => {
    let query = supabase
      .from("aplicaciones")
      .select("*", { count: "exact", head: true })
      .eq("nombre", nombre);
    if (excludeId) query = query.neq("id", excludeId);
    const { count } = await query;
    return (count ?? 0) > 0;
  },

  verificarSlugExiste: async (slug: string, excludeId?: string) => {
    let query = supabase
      .from("aplicaciones")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { count } = await query;
    return (count ?? 0) > 0;
  },

  cargarConteoLicencias: async () => {
    const { data, error } = await supabase
      .from("licencias")
      .select("aplicacion_id");

    if (error) return;

    const conteo: Record<string, number> = {};
    for (const row of data || []) {
      if (row.aplicacion_id) {
        conteo[row.aplicacion_id] = (conteo[row.aplicacion_id] || 0) + 1;
      }
    }
    set({ licenciasPorApp: conteo });
  },
}));
