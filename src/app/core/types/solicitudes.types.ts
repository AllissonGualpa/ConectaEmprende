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
