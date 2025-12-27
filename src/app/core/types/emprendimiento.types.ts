import { Ciudad } from "../../shared/general/shared-general.types";

export interface InformacionRepresentante {
    id: number | null;
    nombre: string;
    apellido: string | null;
    correoCorporativo: string;
    correoPersonal: string;
    telefono: string;
    identificacion: string;
    carrera: string | null;
    semestre: string | null;
    fechaGraduacion: string | null;
    tieneParientesUees: boolean;
    nombrePariente: string | null;
    areaPariente: string | null;
    integrantesEquipo: string;
}

export interface MetricaEmprendimiento {
    emprendimientoId: number;
    metricaId: number;
    valor: string;
}

export interface OpcionPersonaJuridica {
    id: number;
    opcion: string;
    estado: boolean;
}

export interface TipoEmprendimiento {
    id: number;
    tipo: string;
    subTipo: string;
}

export interface Descripcion {
    id: number;
    descripcion: string;
    cantidadMaximaCaracteres?: number;
    estado?: boolean;
}

export interface DescripcionEmprendimiento {
    idEmprendimiento: number;
    idDescripcion: number;
    descripcionBase: string;
    respuesta: string;
}

export interface CategoriaEmprendimiento {
    id: number;
    nombre: string;
}

export interface DeclaracionFinal {
    id: number;
    declaracion: string;
    obligatoria: boolean;
}

export interface DeclaracionFinalEmprendimiento {
    emprendimientoId: number;
    declaracionId: number;
    aceptada: boolean;
    fechaAceptacion: string;
    nombreFirma: string;
}

export interface ParticipacionComunidad {
    emprendimientoId: number;
    opcionParticipacionId: number;
    respuesta: boolean;
    nombreOpcionParticipacion: string;
}

export interface OpcionParticipacionComunidad {
    id: number;
    opcion: string;
}

export interface PresenciaDigital {
    plataforma: string;
    descripcion: string;
}

export interface Multimedia {
    id: number;
    nombreActivo: string;
    urlArchivo: string;
}

export interface EmprendimientoListado {
    idEmprendimiento: number;
    nombreComercialEmprendimiento: string;
    fechaCreacion: string;
    ciudadId: number;
    ciudadNombre: string;
    provinciaId: number;
    provinciaNombre: string;
    estatusEmprendimiento: boolean;
    estadoEmprendimiento: string;
    tipoEmprendimiento: string;
    subTipoEmprendimiento: string;
    tipoEmprendimientoId: number;
    categorias: CategoriaEmprendimiento[];
    multimedia: Multimedia[];
}

export interface EmprendimientosPaginated {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

export interface EmprendimientoPublico {
    id: number;
    nombreComercial: string;
    anioCreacion: string;
    activoEmprendimiento: boolean;
    aceptaDatosPublicos: boolean;
    fechaCreacion: string;
    fechaActualizacion: string;
    estadoEmprendimiento: string;
    usuarioId: number;
    nombreUsuario: string;
    ciudadId: number;
    nombreCiudad: string;
    tipoEmprendimientoId: number;
    nombreTipoEmprendimiento: string;
    categorias: CategoriaEmprendimiento[];
    descripciones: DescripcionEmprendimiento[];
    presenciasDigitales: PresenciaDigital[];
    multimedia: Multimedia[];
}


export interface EmprendimientoDetalle {
    nombreComercial: string;
    anioCreacion: string;
    activoEmprendimiento: boolean;
    aceptaDatosPublicos: boolean;
    tipoEmprendimientoId: number;
    tipoEmprendimiento: string;
    fechaCreacion: string;
    fechaActualizacion: string | null;
    ciudad: Ciudad;
    informacionRepresentante: InformacionRepresentante;
    categorias: CategoriaEmprendimiento[];
    descripciones: DescripcionEmprendimiento[];
    multimedia: Multimedia[];
    metricas: MetricaEmprendimiento[];
    presenciasDigitales: PresenciaDigital[];
    declaracionesFinales: DeclaracionFinalEmprendimiento[];
    participacionesComunidad: ParticipacionComunidad[];
}

export interface Solicitud {
    id: number;
    emprendimientoId: number;
    nombreEmprendimiento: string;
    tipoSolicitud: 'CREACION' | 'ACTUALIZACION';
    estadoSolicitud: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
    observaciones: string | null;
    motivoRechazo: string | null;
    fechaSolicitud: string;
    fechaRespuesta: string | null;
    nombreSolicitante: string;
    nombreRevisor: string | null;
}

export interface Diferencia {
    campo: string;
    valorOriginal: any;
    valorPropuesto: any;
}

export interface DetalleSolicitudAdmin {
    datosPropuestos: EmprendimientoDetalle;
    solicitud: Solicitud;
    datosOriginales?: EmprendimientoDetalle; // Solo para ACTUALIZACION
    diferencias?: Diferencia[]; // Solo para ACTUALIZACION
}
