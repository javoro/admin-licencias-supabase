export interface Permisos {
  analytics: boolean;
  analytics_export_excel: boolean;
  analytics_export_ppt: boolean;
  analytics_trend_chart: boolean;
  analytics_filters: boolean;
}

export interface Licencia {
  id: string;
  clave: string;
  nombre: string;
  activa: boolean;
  permisos: Permisos;
  vence_en: string | null;
  created_at: string;
}

export type LicenciaInsert = Omit<Licencia, "id" | "created_at">;
export type LicenciaUpdate = Partial<Omit<Licencia, "id" | "created_at" | "clave">>;

export const PERMISOS_LABELS: Record<keyof Permisos, string> = {
  analytics: "Sección de Analíticas",
  analytics_export_excel: "Exportar Excel de Analíticas",
  analytics_export_ppt: "Exportar PowerPoint de Analíticas",
  analytics_trend_chart: "Gráfica de tendencia",
  analytics_filters: "Filtros de periodo",
};

export const DEFAULT_PERMISOS: Permisos = {
  analytics: true,
  analytics_export_excel: true,
  analytics_export_ppt: true,
  analytics_trend_chart: true,
  analytics_filters: true,
};
