import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

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
}