export interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    enlace: string;
    leida: boolean;
    fechaCreacion: string;
    fechaLectura: string | null;
    prioridad: string | null;
    tipoNombre: string;
    icono: string | null;
    color: string | null;
    metadata: NotificacionMetadata | null;
    emprendimientoId: number;
    nombreEmprendimiento: string;
    solicitudId: number | null;
    motivo: string | null; 
    observaciones: string | null;  
}

export interface NotificacionMetadata {
    nombreEmprendimiento?: string;
    [key: string]: any;
}

export interface NotificacionesResponse {
    content: Notificacion[];
    pageable: Pageable;
}

export interface Pageable {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}