export interface OpcionRespuestaRequestDTO {
    idEmprendimiento: number;
    idRespuesta: number | null;
    idRespuestaValoracion: number | null;
    idsPregunta: number;
    idsOpciones: number[] | null;
    valorescala: number | null;
    tipoFormulario: string; // 'AUTOEVALUACION' | 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO'
}

export interface ListadoAutoevaluacionDTO {
    idAutoevaluacion: number;
    idValoracionOrigen: number;
    esAutoevaluacion: boolean;
    fechaRespuesta: string;
    idFormulario: number;
    formulario: string;
    idEmprendimiento: number;
    emprendimiento: string;
    valoracionOrigen?: ValoracionResumenDTO;
}

export interface ValoracionResumenDTO {
    idValoracion: number;
    fechaValoracion: string;
    tipoFormulario: string;
    promedio: number;
}

export interface PageableResponse {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

export interface AutoevaluacionesPaginadasResponse {
    content: ListadoAutoevaluacionDTO[];
    pageable: PageableResponse;
}


export interface OpcionRespuestaDTO {
    id: number;
    idRespuesta: number;
    idPregunta: number;
    pregunta: string;
    valorescala: number;
    idEmprendimientos: number;
    opciones: OpcionResponseDTO[];
}

export interface OpcionResponseDTO {
    idOpcion: number;
    opcion: string;
}

export interface AutoevaluacionesPaginadasResponse {
    content: ListadoAutoevaluacionDTO[];
    pageable: PageableResponse;
}

export interface DetalleAutoevaluacionResponse {
    content: OpcionRespuestaDTO[];
    pageable: PageableResponse;
}