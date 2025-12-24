import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { SolicitudesPaginadasResponse } from '../types/solicitudes.types';

@Injectable({
    providedIn: 'root'
})
export class SolicitudesService {

    constructor(private _httpClient: HttpClient) { }

    /**
     * Enviar emprendimiento para aprobación
     * @param emprendimientoId - ID del emprendimiento a enviar
     * @returns Observable con la respuesta del servidor
     */
    enviarParaAprobacion(emprendimientoId: number): Observable<any> {
        return this._httpClient.post(
            `${environment.api_url}/v1/emprendimientos/${emprendimientoId}/enviar-aprobacion`,
            {}
        );
    }

    /**
     * Listar solicitudes pendientes (Admin)
     * @param page - Número de página (default: 0)
     * @param size - Tamaño de página (default: 10)
     * @param sort - Campo para ordenar (default: 'fechaSolicitud')
     * @param direction - Dirección del ordenamiento (default: 'ASC')
     * @returns Observable con las solicitudes paginadas
     */
    listarSolicitudesPendientes(
        page: number = 0,
        size: number = 10,
        sort: string = 'fechaSolicitud',
        direction: 'ASC' | 'DESC' = 'ASC'
    ): Observable<SolicitudesPaginadasResponse> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', `${sort},${direction}`);

        return this._httpClient.get<SolicitudesPaginadasResponse>(
            `${environment.api_url}/v1/solicitudes/admin/pendientes`,
            { params }
        );
    }

    /**
     * Aprobar solicitud (Admin)
     * @param solicitudId - ID de la solicitud a aprobar
     * @returns Observable con la respuesta del servidor
     */
    aprobarSolicitud(solicitudId: number): Observable<any> {
        return this._httpClient.post(
            `${environment.api_url}/v1/solicitudes-aprobacion/admin/${solicitudId}/aprobar`,
            {}
        );
    }

    /**
     * Rechazar solicitud (Admin)
     * @param solicitudId - ID de la solicitud a rechazar
     * @param motivo - Motivo del rechazo
     * @returns Observable con la respuesta del servidor
     */
    rechazarSolicitud(solicitudId: number, motivo: string): Observable<any> {
        return this._httpClient.post(
            `${environment.api_url}/v1/solicitudes-aprobacion/admin/${solicitudId}/rechazar`,
            { motivo }
        );
    }

    /**
     * Enviar observaciones para modificación (Admin)
     * @param solicitudId - ID de la solicitud
     * @param observaciones - Observaciones para el emprendedor
     * @returns Observable con la respuesta del servidor
     */
    enviarObservaciones(solicitudId: number, observaciones: string): Observable<any> {
        return this._httpClient.post(
            `${environment.api_url}/v1/solicitudes-aprobacion/admin/${solicitudId}/observaciones`,
            { observaciones }
        );
    }
}