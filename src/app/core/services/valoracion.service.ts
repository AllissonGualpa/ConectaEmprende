import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AutoevaluacionesPaginadasResponse, DetalleAutoevaluacionResponse, OpcionRespuestaDTO, OpcionRespuestaRequestDTO } from '../types/valoracion.types';

@Injectable({
    providedIn: 'root'
})
export class ValoracionService {

    private readonly _autoevaluaciones = new BehaviorSubject<AutoevaluacionesPaginadasResponse | null>(null);
    private readonly _detalleAutoevaluacion = new BehaviorSubject<DetalleAutoevaluacionResponse | null>(null);

    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for autoevaluaciones
     */
    get autoevaluaciones$(): Observable<AutoevaluacionesPaginadasResponse | null> {
        return this._autoevaluaciones.asObservable();
    }

    /**
     * Getter for detalle autoevaluacion
     */
    get detalleAutoevaluacion$(): Observable<DetalleAutoevaluacionResponse | null> {
        return this._detalleAutoevaluacion.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Guardar respuestas de valoración/autoevaluacion
     * @param respuestas - Array de respuestas del formulario
     * @returns Observable con las respuestas guardadas
     */
    guardarRespuestas(respuestas: OpcionRespuestaRequestDTO[]): Observable<OpcionRespuestaDTO[]> {
        return this._httpClient.post<OpcionRespuestaDTO[]>(
            `${environment.api_url}/v1/formularios/save-opcion-respuesta`,
            respuestas
        );
    }

    /**
     * Listar autoevaluaciones con paginación
     * @param page - Número de página
     * @param size - Tamaño de página
     * @param sort - Criterio de ordenamiento (opcional)
     * @returns Observable con la lista paginada de autoevaluaciones
     */
    listarAutoevaluaciones(
        page: number = 0,
        size: number = 10,
        sort: string = 'fechaRespuesta,desc'
    ): Observable<AutoevaluacionesPaginadasResponse> {
        return this._httpClient.get<AutoevaluacionesPaginadasResponse>(
            `${environment.api_url}/v1/autoevaluacion`,
            {
                params: {
                    page: page.toString(),
                    size: size.toString(),
                    sort: sort
                }
            }
        ).pipe(
            tap((response) => {
                this._autoevaluaciones.next(response);
            })
        );
    }

    /**
     * Obtener detalle de autoevaluación con paginación
     * @param idAutoevaluacion - ID de la autoevaluación
     * @param page - Número de página
     * @param size - Tamaño de página
     * @param sort - Criterio de ordenamiento (opcional)
     * @returns Observable con el detalle paginado de la autoevaluación
     */
    obtenerDetalleAutoevaluacion(
        idAutoevaluacion: number,
        page: number = 0,
        size: number = 10,
        sort: string = 'idPregunta,asc'
    ): Observable<DetalleAutoevaluacionResponse> {
        return this._httpClient.get<DetalleAutoevaluacionResponse>(
            `${environment.api_url}/v1/autoevaluacion/${idAutoevaluacion}/detalle`,
            {
                params: {
                    page: page.toString(),
                    size: size.toString(),
                    sort: sort
                }
            }
        ).pipe(
            tap((response) => {
                this._detalleAutoevaluacion.next(response);
            })
        );
    }
}