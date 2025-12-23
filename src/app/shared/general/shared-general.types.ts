export interface Provincia {
    id: number;
    nombre: string;
    activo: boolean;
}

export interface Ciudad {
    id: number;
    nombreCiudad: string;
    provincia: Provincia;
}

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    urlImagen: string;
    idMultimedia: number;
}