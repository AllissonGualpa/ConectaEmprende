import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

export interface NotificationDto {
  id: number;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  fechaCreacion: string;
  fechaLectura: string | null;
  prioridad: string;
  tipoNombre: string;
  icono: string | null;
  color: string | null;
  metadata: any;
  emprendimientoId: number | null;
  nombreEmprendimiento: string | null;
  solicitudId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = `${Environment.api_url}${Environment.api_notificaciones}`;

  constructor(private http: HttpClient) {}

  /**
   * GET /v1/notificacion?id={usuarioId}
   * Devuelve el array content[] si la respuesta está paginada.
   * Se aceptan page/size opcionales.
   */
  getNotificaciones(usuarioId: number, page?: number, size?: number): Observable<NotificationDto[]> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    let params = new HttpParams().set('id', usuarioId.toString());
    if (page !== undefined) params = params.set('page', String(page));
    if (size !== undefined) params = params.set('size', String(size));

    return this.http
      .get<any>(`${this.baseUrl}`, { headers, params })
      .pipe(
        map(resp => {
          // si viene paginado, tomar resp.content; si no, suponer que resp es ya un array
          if (resp && Array.isArray(resp.content)) return resp.content as NotificationDto[];
          if (Array.isArray(resp)) return resp as NotificationDto[];
          return [];
        })
      );
  }

  /**
   * GET paginado - devuelve la respuesta completa para leer content y metadatos
   */
  getNotificacionesPaged(usuarioId: number, page = 0, size = 10): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    let params = new HttpParams().set('id', usuarioId.toString());
    params = params.set('page', String(page));
    params = params.set('size', String(size));

    return this.http.get<any>(`${this.baseUrl}`, { headers, params });
  }
}
