import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Notificacion, NotificacionesResponse } from '../types/notificacion.types';

@Injectable({
    providedIn: 'root'
})
export class NotificacionesService {

    private readonly _notificaciones = new BehaviorSubject<NotificacionesResponse | null>(null);

    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for notificaciones
     */
    get notificaciones$(): Observable<NotificacionesResponse | null> {
        return this._notificaciones.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Reset BehaviorSubject
    // -----------------------------------------------------------------------------------------------------

    resetNotificaciones(): void {
        this._notificaciones.next(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Obtener notificaciones
     * @param page - Número de página (opcional, por defecto 0)
     * @param size - Tamaño de página (opcional, por defecto 10)
     * @returns Observable con la respuesta de notificaciones
     */
    obtenerNotificaciones(page: number = 0, size: number = 10): Observable<NotificacionesResponse> {
        return this._httpClient.get<NotificacionesResponse>(
            `${environment.api_url}/v1/notificacion?page=${page}&size=${size}`
        ).pipe(
            tap((response) => {
                this._notificaciones.next(response);
            })
        );
    }

    /**
     * Obtener notificación por ID
     * @param id - ID de la notificación
     * @returns Observable con la notificación
     */
    obtenerNotificacionPorId(id: number): Observable<Notificacion> {
        return this._httpClient.get<Notificacion>(
            `${environment.api_url}/v1/notificacion/${id}`
        );
    }

    /**
     * Marcar notificación como leída
     * @param usuarioId - ID del usuario
     * @param notificacionId - ID de la notificación
     * @returns Observable vacío
     */
    marcarComoLeida(usuarioId: number, notificacionId: number): Observable<any> {
        return this._httpClient.put(
            `${environment.api_url}/v1/notificacion/marcar-leida?usuarioId=${usuarioId}&notificacionId=${notificacionId}`,
            {}
        );
    }
}