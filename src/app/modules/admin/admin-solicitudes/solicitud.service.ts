import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud } from './admin-solicitudes.component';
import { Environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private baseApiUrl = Environment.api_url + Environment.api_solicitudes;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getSolicitudes(params: {
    page: number;
    size: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<{
    content: Solicitud[];
    pageable: { length: number; lastPage: number; page: number; size: number };
  } | Solicitud[]> {
    let url = `${this.baseApiUrl}/admin/pendientes`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  aprobarSolicitud(solicitudId: number): Observable<{
    mensaje: string;
    solicitudId: number;
  }> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/aprobar`;
    return this.http.post<any>(url, {}, { headers: this.getHeaders() });
  }

  rechazarSolicitud(
    solicitudId: number,
    motivo: string
  ): Observable<{
    mensaje: string;
    solicitudId: number;
  }> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/rechazar`;
    const body = { motivo };
    return this.http.post<any>(url, body, { headers: this.getHeaders() });
  }

  enviarObservaciones(
    solicitudId: number,
    observaciones: string
  ): Observable<{
    mensaje: string;
    solicitudId: number;
  }> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/observaciones`;
    const body = { observaciones };
    return this.http.post<any>(url, body, { headers: this.getHeaders() });
  }

  enviarSolicitudEmprendimiento(emprendimientoId: number): Observable<{
    emprendimientoId?: number;
  }> {
    const url = `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/enviar`;
    return this.http.post<any>(url, {}, { headers: this.getHeaders() });
  }
}