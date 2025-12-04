import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class EventoService {
  
  private baseUrl = Environment.api_url + Environment.api_eventos;

  constructor(private http: HttpClient) {}

  /**
   * Crea un evento en la API.
   * data puede ser JSON o FormData (si incluye imagen binaria).
   */
  createEvent(
    data: any,
    options?: { idEmprendimiento?: number; idMultimedia?: number; token?: string; isFormData?: boolean }
  ): Observable<any> {
    const idEmp = options?.idEmprendimiento;
    const url = `${this.baseUrl}/crear` + (idEmp ? `?idEmprendimiento=${idEmp}` : '');

    let headers = new HttpHeaders();
    const token = options?.token;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // No seteamos Content-Type si es FormData; el browser lo hace.
    if (!options?.isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http.post(url, data, { headers }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * Inactiva (desactiva) un evento en la API (ADMIN).
   * Endpoint: /v1/eventos/admin/:idEvento/desactivar
   */
  inactivateEvent(idEvento: string | number, options?: { token?: string }): Observable<any> {
    const url = `${this.baseUrl}/admin/${idEvento}/desactivar`;
    let headers = new HttpHeaders();
    const token =
      options?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http
      .put(url, {}, { headers, responseType: 'text' })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * cancelar evento event (alias of inactivate) - admin
   * endpoint: /v1/eventos/inactivar/:idEvento
   */
  cancelEvent(idEvento: string | number, options?: { token?: string }): Observable<any> {
    // Reuse same endpoint as inactivateEvent
    return this.inactivateEvent(idEvento, options);
  }

  /**
   * Activa (reactiva) un evento en la API (ADMIN).
   * Endpoint: /v1/eventos/admin/:idEvento/activar
   */
  activateEvent(idEvento: string | number, options?: { token?: string }): Observable<any> {
    const url = `${this.baseUrl}/admin/${idEvento}/activar`;
    let headers = new HttpHeaders();
    const token =
      options?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http
      .put(url, {}, { headers, responseType: 'text' })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Edita un evento existente en la API.
   * Endpoint: /v1/eventos/editar/:idEvento
   * data puede ser JSON o FormData (si incluye imagen binaria).
   */
  editEvent(
    idEvento: string | number,
    data: any,
    options?: { token?: string; isFormData?: boolean }
  ): Observable<any> {
    const url = `${this.baseUrl}/editar/${idEvento}`;

    let headers = new HttpHeaders();
    const token =
      options?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Solo seteamos Content-Type si NO es FormData
    if (!options?.isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http.put(url, data || {}, { headers }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * Obtener lista de eventos desde la API
   */
  getEvents(options?: { token?: string }): Observable<any> {
    const url = `${this.baseUrl}/filtrar`;
    let headers = new HttpHeaders();
    const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get(url, { headers }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Obtener eventos públicos paginados.
   * Endpoint: /v1/eventos/publico?mes=11&page=0&size=10
   */
  getPublicEvents(options?: { mes?: number; page?: number; size?: number; token?: string }): Observable<any> {
    const url = `${this.baseUrl}/publico`;
    let headers = new HttpHeaders();
    const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let params = new HttpParams();
    if (options?.mes != null) params = params.set('mes', String(options.mes));
    if (options?.page != null) params = params.set('page', String(options.page));
    if (options?.size != null) params = params.set('size', String(options.size));

    return this.http.get(url, { headers, params }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Obtener eventos asociados al emprendedor (paginado).
   * Endpoint: /v1/eventos/emprendedor?page=0&size=5
   */
  getEmprendedorEvents(options?: { page?: number; size?: number; token?: string }): Observable<any> {
    const url = `${this.baseUrl}/emprendedor`;
    let headers = new HttpHeaders();
    const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let params = new HttpParams();
    if (options?.page != null) params = params.set('page', String(options.page));
    if (options?.size != null) params = params.set('size', String(options.size));

    return this.http.get(url, { headers, params }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Obtener eventos para el administrador con filtros y paginación.
   * Ejemplo: /v1/eventos/admin?tipoEvento=presencial&fechaInicio=2024-11-01T00:00:00&fechaFin=2025-12-31T23:59:59&page=0&size=15
   */
  getAdminEvents(options?: { tipoEvento?: string; fechaInicio?: string; fechaFin?: string; page?: number; size?: number; token?: string }): Observable<any> {
    const url = `${this.baseUrl}/admin`;
    let headers = new HttpHeaders();
    const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let params = new HttpParams();
    if (options?.tipoEvento) params = params.set('tipoEvento', options.tipoEvento);
    if (options?.fechaInicio) params = params.set('fechaInicio', options.fechaInicio);
    if (options?.fechaFin) params = params.set('fechaFin', options.fechaFin);
    if (options?.page != null) params = params.set('page', String(options.page));
    if (options?.size != null) params = params.set('size', String(options.size));

    return this.http.get(url, { headers, params }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Obtener un evento público por id.
   * Endpoint: /v1/eventos/publico/:id
   */
  getEventById(id: string | number, options?: { token?: string }): Observable<any> {
    const url = `${this.baseUrl}/publico/${id}`;
    return this.http
      .get(url)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
