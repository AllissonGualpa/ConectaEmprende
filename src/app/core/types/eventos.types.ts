export interface AdminEventoItemDto {
    idEvento: number;
    titulo: string;
    idEmprendimiento: number;
    nombreEmprendimiento: string;
    fechaEvento: string;      // ISO
    fechaCreacion: string;    // ISO
    estadoEvento: string;     // 'programado', etc.
    tipoEvento: string;       // 'presencial', etc.
    activo: boolean;
}

export interface AdminEventosPageableDto {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

export interface AdminEventosResponseDto {
    content: AdminEventoItemDto[];
    pageable: AdminEventosPageableDto;
}