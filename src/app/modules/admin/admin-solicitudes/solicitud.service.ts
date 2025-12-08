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
    // Endpoint indicado: solo pendientes
    let url = `${this.baseApiUrl}/admin/pendientes`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  cambiarEstadoSolicitud(
    idSolicitud: number,
    nuevoEstado: 'APROBADA' | 'RECHAZADA',
    userId: number
  ): Observable<null> {
    // TODO: ajustar al endpoint real de tu backend
    const url = `${this.baseApiUrl}/admin/${idSolicitud}/estado?nuevoEstado=${nuevoEstado}&idUsuario=${userId}`;
    return this.http.put<null>(url, {}, { headers: this.getHeaders() });
  }
}
