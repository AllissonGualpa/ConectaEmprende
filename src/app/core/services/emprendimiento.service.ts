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
    EmprendimientoPublico,
    EmprendimientoListado,
    EmprendimientosPaginated
} from '../types/emprendimiento.types';
import { HttpParamsUtil } from '../../shared/utils/http-params.util';

@Injectable({
    providedIn: 'root'
})
export class EmprendimientoService {

    private readonly _opcionesPersonaJuridica = new BehaviorSubject<OpcionPersonaJuridica[]>([]);
    private readonly _tiposEmprendimiento = new BehaviorSubject<TipoEmprendimiento[]>([]);
    private readonly _descripciones = new BehaviorSubject<Descripcion[]>([]);
    private readonly _declaracionesFinales = new BehaviorSubject<DeclaracionFinal[]>([]);
    private readonly _opcionesParticipacionComunidad = new BehaviorSubject<OpcionParticipacionComunidad[]>([]);
    private readonly _emprendimientoPublico = new BehaviorSubject<EmprendimientoPublico | null>(null);
    private readonly _emprendimientos = new BehaviorSubject<EmprendimientoListado[]>([]);
    private readonly _emprendimientosPaginated = new BehaviorSubject<EmprendimientosPaginated | null>(null);

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

    /**
     * Getter for emprendimiento publico
     */
    get emprendimientoPublico$(): Observable<EmprendimientoPublico | null> {
        return this._emprendimientoPublico.asObservable();
    }

    /**
     * Getter for emprendimientos
     */
    get emprendimientos$(): Observable<EmprendimientoListado[]> {
        return this._emprendimientos.asObservable();
    }

    /**
     * Getter for emprendimientos paginated
     */
    get emprendimientosPaginated$(): Observable<EmprendimientosPaginated | null> {
        return this._emprendimientosPaginated.asObservable();
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

    resetEmprendimientoPublico(): void {
        this._emprendimientoPublico.next(null);
    }

    resetEmprendimientos(): void {
        this._emprendimientos.next([]);
    }

    resetEmprendimientosPaginated(): void {
        this._emprendimientosPaginated.next(null);
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

    /**
     * Obtener emprendimiento público por ID
     * @param id - ID del emprendimiento
     * @returns Observable con los datos del emprendimiento público
     */
    obtenerEmprendimientoPublico(id: number): Observable<EmprendimientoPublico> {
        return this._httpClient.get<EmprendimientoPublico>(`${environment.api_url}/v1/emprendimientos/publico/${id}`).pipe(
            tap((emprendimiento) => {
                this._emprendimientoPublico.next(emprendimiento);
            }),
        );
    }

    /**
     * Crear emprendimiento
     * @param formData
     */
    crearEmprendimiento(formData: FormData): Observable<any> {
        return this._httpClient.post(`${environment.api_url}/v1/emprendimientos`, formData);
    }


    /**
     * Obtener emprendimientos filtrados con paginación
     * @param page - Número de página
     * @param size - Tamaño de página
     * @param nombre - Filtro por nombre
     * @param tipo - Filtro por tipo
     * @param subtipo - Filtro por subtipo (Servicio/Producto)
     * @param categoria - Filtro por categoría
     * @param ciudad - Filtro por ciudad
     * @returns Observable con la respuesta paginada
     */
    getEmprendimientosFiltrado(
        page: number = 0,
        size: number = 10,
        nombre?: string,
        tipo?: string,
        subtipo?: string,
        categoria?: string,
        ciudad?: string
    ): Observable<{ pageable: EmprendimientosPaginated; content: EmprendimientoListado[] }> {
        return this._httpClient.get<{ pageable: EmprendimientosPaginated; content: EmprendimientoListado[] }>(
            `${environment.api_url}/v1/emprendimientos`,
            {
                params: HttpParamsUtil.cleanParams({
                    page,
                    size,
                    nombre,
                    tipo,
                    subtipo,
                    categoria,
                    ciudad
                })
            }
        ).pipe(
            tap((response) => {
                this._emprendimientos.next(response.content);
                this._emprendimientosPaginated.next(response.pageable);
            })
        );
    }

}