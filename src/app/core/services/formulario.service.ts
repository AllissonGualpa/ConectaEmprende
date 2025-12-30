import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Formulario } from '../types/formulario.types';

@Injectable({
    providedIn: 'root'
})
export class FormulariosService {

    private readonly _formularioActual = new BehaviorSubject<Formulario | null>(null);

    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for formulario actual
     */
    get formularioActual$(): Observable<Formulario | null> {
        return this._formularioActual.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Reset BehaviorSubject
    // -----------------------------------------------------------------------------------------------------

    resetFormularioActual(): void {
        this._formularioActual.next(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Obtener formulario por tipo
     * @param tipo - Tipo de formulario (AUTOEVALUACION, EVALUACION_SERVICIO, EVALUACION_PRODUCTO)
     * @returns Observable con el formulario completo
     */
    obtenerFormularioPorTipo(tipo: 'AUTOEVALUACION' | 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO'): Observable<Formulario> {
        return this._httpClient.get<Formulario>(
            `${environment.api_url}/v1/formularios/tipo/${tipo}`
        ).pipe(
            tap((formulario) => {
                this._formularioActual.next(formulario);
            })
        );
    }
}