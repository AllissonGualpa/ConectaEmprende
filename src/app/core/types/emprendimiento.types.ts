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
    cantidadMaximaCaracteres: number;
    estado: boolean;
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