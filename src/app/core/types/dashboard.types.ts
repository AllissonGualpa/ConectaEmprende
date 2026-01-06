// Interfaces
export interface EmprendimientoMenosVisto {
  id: number;
  idEmprendimiento: number;
  nombreEmprendimiento: string;
  vistas: number;
  fechaRegistro: string;
  // Campos adicionales para el componente
  nombre?: string;
  categoria?: string;
  visitas?: number;
  iniciales?: string;
}

export interface FiltroMetrica {
  id: number;
  idEmprendimiento: number;
  nombreEmprendimiento: string;
  vistas: number;
  fechaRegistro: string;
}

export interface CategoriaDTO {
  id: number;
  nombre: string;
  descripcion: string;
  urlImagen: string;
  idMultimedia: number;
}

export interface CategoriaDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  urlImagen: string;
  idMultimedia: number;
}

export interface CategoriaConVistas {
  categoria: CategoriaDetalle;
  vistas: number;
}

export interface CategoriaMasVistaResponse {
  categorias: CategoriaConVistas[];
}

export interface EmprendimientoTop {
  id: number;
  idEmprendimiento?: number;
  nombre?: string;
  nombreEmprendimiento?: string;
  categoria?: string;
  calificacion?: number;
  visitas?: number;
  vistas?: number;
  fechaRegistro?: string;
  iniciales?: string;
}

export interface CategoriaMasVista {
  nombre: string;
  visitas: number;
  ejemplo?: string;
}

export interface PreguntaAutoevaluacion {
  pregunta: string;
  promedio: number;
}

export interface MetricasGenerales {
  totalUsuarios: number;
  totalEmprendimientos: number;
  totalVisitas: number;
}

export interface RankingGlobalDTO {
  idEmprendimiento: number;
  nombreEmprendimiento: string;
  promedioGlobal: number;
}

export interface RankingPreguntaDTO {
  idEmprendimiento: number;
  nombreEmprendimiento: string;
  idPregunta: number;
  pregunta: string;
  promedioPregunta: number;
}

export interface PageableInfo {
  length: number;
  size: number;
  page: number;
  lastPage: number;
}

export interface PageResponseDTO<T> {
  content: T[];
  pageable: PageableInfo;
}
