import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { 
    DetalleSolicitudAdmin, 
    MiVistaSolicitud, 
    SolicitudesPaginadasResponse 
} from '../types/solicitudes.types';

@Injectable({
    providedIn: 'root'
})
export class SolicitudesService {

    private readonly _detalleSolicitudAdmin = new BehaviorSubject<DetalleSolicitudAdmin | null>(null);
    private readonly _miVistaSolicitud = new BehaviorSubject<MiVistaSolicitud | null>(null);

    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for detalle solicitud admin
     */
    get detalleSolicitudAdmin$(): Observable<DetalleSolicitudAdmin | null> {
        return this._detalleSolicitudAdmin.asObservable();
    }

    /**
     * Getter for mi vista solicitud (emprendedor)
     */
    get miVistaSolicitud$(): Observable<MiVistaSolicitud | null> {
        return this._miVistaSolicitud.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Reset BehaviorSubject
    // -----------------------------------------------------------------------------------------------------

    resetDetalleSolicitudAdmin(): void {
        this._detalleSolicitudAdmin.next(null);
    }

    resetMiVistaSolicitud(): void {
        this._miVistaSolicitud.next(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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
     * Guardar propuesta de cambios para emprendimiento PUBLICADO
     * @param emprendimientoId - ID del emprendimiento
     * @param datosPropuestos - Datos propuestos para modificación
     * @returns Observable con la respuesta del servidor
     */
    guardarPropuesta(emprendimientoId: number, datosPropuestos: any): Observable<any> {
        return this._httpClient.post(
            `${environment.api_url}/v1/solicitudes/emprendimiento/${emprendimientoId}/propuesta`,
            datosPropuestos
        );
    }

    /**
     * Modificar y reenviar solicitud (Emprendedor)
     * @param solicitudId - ID de la solicitud a modificar
     * @param datosActualizados - Datos actualizados del emprendimiento
     * @returns Observable con la respuesta del servidor
     */
    modificarYReenviar(solicitudId: number, datosActualizados: any): Observable<any> {
        return this._httpClient.put(
            `${environment.api_url}/v1/solicitudes/${solicitudId}/modificar-reenviar`,
            datosActualizados
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
            `${environment.api_url}/v1/solicitudes/admin/${solicitudId}/aprobar`,
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
            `${environment.api_url}/v1/solicitudes/admin/${solicitudId}/rechazar`,
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
            `${environment.api_url}/v1/solicitudes/admin/${solicitudId}/observaciones`,
            { observaciones }
        );
    }

    /**
     * Obtener detalle de solicitud con comparación (Admin)
     * @param solicitudId - ID de la solicitud
     * @returns Observable con los datos de la solicitud para revisión
     */
    obtenerDetalleSolicitudAdmin(solicitudId: number): Observable<DetalleSolicitudAdmin> {
        return this._httpClient.get<DetalleSolicitudAdmin>(
            `${environment.api_url}/v1/solicitudes/admin/${solicitudId}/detalle`
        ).pipe(
            tap((detalle) => {
                this._detalleSolicitudAdmin.next(detalle);
            })
        );
    }

    /**
     * Obtener mi vista de solicitud (Emprendedor)
     * @param emprendimientoId - ID del emprendimiento
     * @returns Observable con los datos de la solicitud del emprendedor
     */
    obtenerMiVistaSolicitud(emprendimientoId: number): Observable<MiVistaSolicitud> {
        return this._httpClient.get<MiVistaSolicitud>(
            `${environment.api_url}/v1/solicitudes/emprendimiento/${emprendimientoId}/mi-vista`
        ).pipe(
            tap((detalle) => {
                this._miVistaSolicitud.next(detalle);
            })
        );
    }
}