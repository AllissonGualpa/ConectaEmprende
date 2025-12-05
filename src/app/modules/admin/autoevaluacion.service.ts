import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment';
import { Autoevaluacion } from './autoevaluacion.types';

@Injectable({ providedIn: 'root' })
export class AutoevaluacionService {
  private baseApiUrl = Environment.api_url + '/v1/autoevaluacion';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');

    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  /**
   * GET /v1/autoevaluacion/emprendimientos
   * Retorna TODAS las autoevaluaciones del sistema
   * (sin paginación, depende del backend)
   */
  getEmprendimientos(params?: {
    search?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<Autoevaluacion[]> {
    let httpParams = new HttpParams();

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.fechaInicio) {
      httpParams = httpParams.set('fechaInicio', params.fechaInicio);
    }
    if (params?.fechaFin) {
      httpParams = httpParams.set('fechaFin', params.fechaFin);
    }

    return this.http.get<Autoevaluacion[]>(
      `${this.baseApiUrl}/emprendimientos`,
      {
        headers: this.getHeaders(),
        params: httpParams
      }
    );
  }

  /**
   * GET /v1/autoevaluacion/respuesta-emprendimiento/{id}
   * Obtiene los datos COMPLETOS de una autoevaluación/emprendimiento
   */
  getAutoevaluacionById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseApiUrl}/respuesta-emprendimiento/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * POST /v1/autoevaluacion/save
   * Crea o edita la autoevaluación según tu backend
   */
  saveAutoevaluacion(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseApiUrl}/save`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}
