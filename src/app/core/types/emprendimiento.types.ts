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

export interface OpcionParticipacionComunidad {
    id: number;
    opcion: string;
}

export interface PresenciaDigital {
    plataforma: string;
    descripcion: string;
}

export interface Multimedia {
    nombreActivo: string;
    urlArchivo: string;
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