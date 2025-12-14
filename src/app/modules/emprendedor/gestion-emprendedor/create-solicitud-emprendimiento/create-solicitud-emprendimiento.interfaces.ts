export interface EmprendimientoDto {
  id: number;
  correoComercial: string;
  correoUees: string;
  identificacion: string;
  parienteDirecto: string;
  nombreComercialEmprendimiento: string;
  fechaCreacion: string; // ISO
  ciudad: number;
  provinia: number;
  estadoEmpredimiento: boolean;
  tipoEmprendimiento: string;
  tipoEmprendimientoId: number;
  datosPublicos: boolean;
}

export interface CategoriaDto {
  id: number;
  nombre: string;
  descripcion: string;
  urlImagen: string;
  idMultimedia: number;
}

export interface EmprendimientoCategoriaDto {
  emprendimiento: EmprendimientoDto;
  categoria: CategoriaDto;
  nombreCategoria: string;
}

export interface DescripcionDto {
  tipoDescripcion: string;
  descripcion: string;
  maxCaracteres: number;
  obligatorio: boolean;
  idEmprendimiento: number;
  emprendimientoId: number;
}

export interface MetricaDto {
  emprendimientoId: number;
  metricaId: number;
  valor: string;
}

export interface PresenciaDigitalDto {
  emprendimientoId: number;
  plataforma: string;
  descripcion: string;
}

export interface ParticipacionComunidadDto {
  emprendimientoId: number;
  opcionParticipacionId: number;
  respuesta: boolean;
  nombreOpcionParticipacion: string;
}

export interface DeclaracionFinalDto {
  emprendimientoId: number;
  declaracionId: number;
  aceptada: boolean;
  fechaAceptacion: string; // ISO
  nombreFirma: string;
}

export interface SolicitudEmprendimientoDataDto {
  usuarioId: number;
  emprendimiento: EmprendimientoDto;
  tipoAccion: string;
  categorias: EmprendimientoCategoriaDto[];
  descripciones: DescripcionDto[];
  metricas: MetricaDto[];
  presenciasDigitales: PresenciaDigitalDto[];
  participacionesComunidad: ParticipacionComunidadDto[];
  declaracionesFinales: DeclaracionFinalDto[];
  tiposMultimedia: string[];
}

export interface SolicitudEmprendimientoDto {
  data: SolicitudEmprendimientoDataDto;
  imagenes: string[];
}
