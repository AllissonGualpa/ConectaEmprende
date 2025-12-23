import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { 
    OpcionPersonaJuridica, 
    TipoEmprendimiento, 
    Descripcion,
    DeclaracionFinal,
    OpcionParticipacionComunidad,
} from '../types/emprendimiento.types';

@Injectable({
    providedIn: 'root'
})
export class EmprendimientoService {

    private readonly _opcionesPersonaJuridica = new BehaviorSubject<OpcionPersonaJuridica[]>([]);
    private readonly _tiposEmprendimiento = new BehaviorSubject<TipoEmprendimiento[]>([]);
    private readonly _descripciones = new BehaviorSubject<Descripcion[]>([]);
    private readonly _declaracionesFinales = new BehaviorSubject<DeclaracionFinal[]>([]);
    private readonly _opcionesParticipacionComunidad = new BehaviorSubject<OpcionParticipacionComunidad[]>([]);

    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for opciones persona juridica
     */
    get opcionesPersonaJuridica$(): Observable<OpcionPersonaJuridica[]> {
        return this._opcionesPersonaJuridica.asObservable();
    }

    /**
     * Getter for tipos emprendimiento
     */
    get tiposEmprendimiento$(): Observable<TipoEmprendimiento[]> {
        return this._tiposEmprendimiento.asObservable();
    }

    /**
     * Getter for descripciones
     */
    get descripciones$(): Observable<Descripcion[]> {
        return this._descripciones.asObservable();
    }

    /**
     * Getter for declaraciones finales
     */
    get declaracionesFinales$(): Observable<DeclaracionFinal[]> {
        return this._declaracionesFinales.asObservable();
    }

    /**
     * Getter for opciones participacion comunidad
     */
    get opcionesParticipacionComunidad$(): Observable<OpcionParticipacionComunidad[]> {
        return this._opcionesParticipacionComunidad.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Reset BehaviorSubject
    // -----------------------------------------------------------------------------------------------------

    resetOpcionesPersonaJuridica(): void {
        this._opcionesPersonaJuridica.next([]);
    }

    resetTiposEmprendimiento(): void {
        this._tiposEmprendimiento.next([]);
    }

    resetDescripciones(): void {
        this._descripciones.next([]);
    }

    resetDeclaracionesFinales(): void {
        this._declaracionesFinales.next([]);
    }

    resetOpcionesParticipacionComunidad(): void {
        this._opcionesParticipacionComunidad.next([]);
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Consulta opciones persona juridica
     * @returns
     */
    getOpcionesPersonaJuridica(): Observable<OpcionPersonaJuridica[]> {
        return this._httpClient.get<OpcionPersonaJuridica[]>(`${environment.api_url}/v1/opciones-persona-juridica`).pipe(
            tap((opciones) => {
                this._opcionesPersonaJuridica.next(opciones);
            }),
        );
    }

    /**
     * Consulta tipos de emprendimiento
     * @returns
     */
    getTiposEmprendimiento(): Observable<TipoEmprendimiento[]> {
        return this._httpClient.get<TipoEmprendimiento[]>(`${environment.api_url}/v1/tipos-emprendimiento`).pipe(
            tap((tipos) => {
                this._tiposEmprendimiento.next(tipos);
            }),
        );
    }

    /**
     * Consulta descripciones
     * @returns
     */
    getDescripciones(): Observable<Descripcion[]> {
        return this._httpClient.get<Descripcion[]>(`${environment.api_url}/v1/descripciones`).pipe(
            tap((descripciones) => {
                this._descripciones.next(descripciones);
            }),
        );
    }

    /**
     * Consulta declaraciones finales
     * @returns
     */
    getDeclaracionesFinales(): Observable<DeclaracionFinal[]> {
        return this._httpClient.get<DeclaracionFinal[]>(`${environment.api_url}/v1/declaraciones-finales`).pipe(
            tap((declaraciones) => {
                this._declaracionesFinales.next(declaraciones);
            }),
        );
    }

    /**
     * Consulta opciones participacion comunidad
     * @returns
     */
    getOpcionesParticipacionComunidad(): Observable<OpcionParticipacionComunidad[]> {
        return this._httpClient.get<OpcionParticipacionComunidad[]>(`${environment.api_url}/v1/opciones-participacion-comunidad`).pipe(
            tap((opciones) => {
                this._opcionesParticipacionComunidad.next(opciones);
            }),
        );
    }

}

