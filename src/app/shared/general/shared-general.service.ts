import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Ciudad, Provincia, Categoria } from './shared-general.types';

@Injectable({
    providedIn: 'root'
})
export class SharedGeneralService {

    private readonly _provincias = new BehaviorSubject<Provincia[]>([]);
    private readonly _ciudades = new BehaviorSubject<Ciudad[]>([]);
    private readonly _categorias = new BehaviorSubject<Categoria[]>([]);


    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for provincias
     */
    get provincias$(): Observable<Provincia[]> {
        return this._provincias.asObservable();
    }

    /**
     * Getter for ciudades
     */
    get ciudades$(): Observable<Ciudad[]> {
        return this._ciudades.asObservable();
    }

    /**
     * Getter for categorias
     */
    get categorias$(): Observable<Categoria[]> {
        return this._categorias.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Reset BehaviorSubject
    // -----------------------------------------------------------------------------------------------------

    resetCiudades(): void {
        this._ciudades.next([]);
    }

    resetCategorias(): void {
        this._categorias.next([]);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Consulta provincias
     * @returns
     */
    getProvincias(): Observable<Provincia[]> {
        return this._httpClient.get<Provincia[]>(`${environment.api_url}/v1/provincia`).pipe(
            tap((provincias) => {
                this._provincias.next(provincias);
            }),
        );
    }

    /**
     * Consulta Ciudades
     * @returns
     */
    getCiudades(): Observable<Ciudad[]> {
        return this._httpClient.get<Ciudad[]>(`${environment.api_url}/v1/ciudad`).pipe(
            tap((ciudades) => {
                this._ciudades.next(ciudades);
            }),
        );
    }

    /**
     * Consulta categorias
     * @returns
     */
    getCategorias(): Observable<Categoria[]> {
        return this._httpClient.get<Categoria[]>(`${environment.api_url}/v1/categorias`).pipe(
            tap((categorias) => {
                this._categorias.next(categorias);
            }),
        );
    }
}