export interface OpcionPregunta {
    idOpcion: number;
    opcion: string;
}

export interface Pregunta {
    idPregunta: number;
    pregunta: string;
    tipo: 'MULTIPLE' | 'ESCALA';
    numeroRespuestas: number;
    obligatoria: boolean;
    orden: number;
    opciones: OpcionPregunta[] | null;
}

export interface Formulario {
    idFormulario: number;
    nombre: string;
    tipoFormulario: 'AUTOEVALUACION' | 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO';
    preguntas: Pregunta[];
}