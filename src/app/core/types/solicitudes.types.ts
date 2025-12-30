import { EmprendimientoDetalle } from "./emprendimiento.types";

export interface SolicitudAprobacionListado {
    id: number;
    emprendimientoId: number;
    nombreEmprendimiento: string;
    tipoSolicitud: 'CREACION' | 'ACTUALIZACION';
    estadoSolicitud: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EN_REVISION';
    ciudadId: number;
    nombreCiudad: string;
    tipoEmprendimiento: string;
    anioCreacion: string;
    fechaSolicitud: string;
    nombreSolicitante: string;
}

export interface PageableResponse {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

export interface SolicitudesPaginadasResponse {
    content: SolicitudAprobacionListado[];
    pageable: PageableResponse;
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

// ✅ Interface para la vista del ADMIN
export interface DetalleSolicitudAdmin {
    datosPropuestos: EmprendimientoDetalle;
    solicitud: Solicitud;
    datosOriginales?: EmprendimientoDetalle; // Solo para ACTUALIZACION
    diferencias?: Diferencia[]; // Solo para ACTUALIZACION
}

// ✅ Interface para MI VISTA (Emprendedor)
export interface MiVistaSolicitud {
    datosActuales: EmprendimientoDetalle;
    datosPropuestos: EmprendimientoDetalle;
    estadoEmprendimiento: string; // "PENDIENTE_APROBACION", "APROBADO", etc.
    estadoSolicitud: string; // "PENDIENTE", "APROBADA", "RECHAZADA"
    observaciones: string | null;
    motivoRechazo: string | null;
    tieneSolicitudActiva: boolean;
    solicitudId: number;
}