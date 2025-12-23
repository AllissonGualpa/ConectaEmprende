import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// DTOs para Formularios
export interface OpcionRespuestaDto {
    idOpcion: number;
    textoOpcion: string;
    valor: number;
}

export interface PreguntaDto {
    idPregunta: number;
    pregunta: string;
    tipo: 'ESCALA' | 'SELECCION_MULTIPLE' | 'TEXTO_LIBRE';
    numeroRespuestas: number;
    obligatoria: boolean;
    orden: number;
    opciones: OpcionRespuestaDto[] | null;
}

export interface FormularioDto {
    idFormulario: number;
    nombre: string;
    tipoFormulario: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO';
    preguntas: PreguntaDto[];
}

// DTOs para Respuestas
export interface RespuestaDto {
    idPregunta: number;
    respuesta: string | number;
}

export interface EnviarValoracionDto {
    idFormulario: number;
    idEmprendimiento?: number;
    idEvento?: number;
    respuestas: RespuestaDto[];
}

@Injectable({
    providedIn: 'root'
})
export class ValoracionService {

    private baseUrl = environment.api_url + '/v1/formularios';

    constructor(private http: HttpClient) { }

    /**
     * Obtener formulario por tipo.
     * Endpoint: /v1/formularios/tipo/:tipoFormulario
     */
   getFormularioByTipo(
        tipoFormulario: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO' | 'AUTOEVALUACION'
    ): Observable<FormularioDto> {
        const url = `${this.baseUrl}/tipo/${tipoFormulario}`;
        
        // NO enviamos headers de autenticación porque es público
        return this.http.get<FormularioDto>(url).pipe(
            catchError((err) => throwError(() => err))
        );
    }

}