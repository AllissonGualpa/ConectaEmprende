import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class EventoService {
  
  private baseUrl = 'https://eureka-emprende.onrender.com';

  constructor(private http: HttpClient) {}

  /**
   * Crea un evento en la API.
   * @param data Objeto con campos ya mapeados a los nombres esperados por la API (titulo, descripcion, fechaEvento, etc.)
   * @param options.idEmprendimiento numero que se añade como query param: ?idEmprendimiento=4
   * @param options.idMultimedia opcional: id de multimedia ya subida
   */
  createEvent(data: any, options?: { idEmprendimiento?: number; idMultimedia?: number; token?: string }): Observable<any> {
    const idEmp = options?.idEmprendimiento;
    const url = `${this.baseUrl}/v1/eventos/crear` + (idEmp ? `?idEmprendimiento=${idEmp}` : '');

    // Si el payload incluye un File en data.imagen y la API no soporta archivo directo
    // puedes subirlo separadamente y pasar idMultimedia en options
    let body: any;
    let headers = new HttpHeaders();

    // Add Authorization header if token provided in options
    const token = options?.token;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (data?.imagen instanceof File) {
      // Enviar multipart/form-data: adjuntar el archivo bajo un unico nombre
      body = new FormData();
  const fileField = 'file';
      // Mapear todos los campos simples
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value == null) return;
        if (key === 'imagen') {
          // Adjuntar el archivo usando el nombre solicitado por opciones o 'file'
          body.append(fileField, value, value.name);
        } else if (value instanceof Date) {
          body.append(key, value.toISOString());
        } else {
          body.append(key, String(value));
        }
      });
      //si tenemos idMultimedia, lo añadimos
      if (options?.idMultimedia) body.append('idMultimedia', String(options.idMultimedia));
    } else {
      //envia el json (la api espera json segun el payload)
      if (data.fechaEvento instanceof Date) data.fechaEvento = data.fechaEvento.toISOString();
      if (options?.idMultimedia) data.idMultimedia = options.idMultimedia;
      body = data;
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http.post(url, body, { headers }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Edita un evento existente en la API.
   * Endpoint: /v1/eventos/editar/:idEvento/:idEmprendimiento
   */
  editEvent(idEvento: string | number, idEmprendimiento?: number, data?: any, options?: { idMultimedia?: number; token?: string }): Observable<any> {
    const idEmp = idEmprendimiento ?? 4; // por defecto 4 si no se provee
    const url = `${this.baseUrl}/v1/eventos/editar/${idEvento}/${idEmp}`;

    let body: any;
    let headers = new HttpHeaders();

    const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (data?.imagen instanceof File) {
      body = new FormData();
      const fileField = 'file';
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value == null) return;
        if (key === 'imagen') {
          body.append(fileField, value, value.name);
        } else if (value instanceof Date) {
          body.append(key, value.toISOString());
        } else {
          body.append(key, String(value));
        }
      });
      if (options?.idMultimedia) body.append('idMultimedia', String(options.idMultimedia));
    } else {
      if (data && data.fechaEvento instanceof Date) data.fechaEvento = data.fechaEvento.toISOString();
      if (options?.idMultimedia) data.idMultimedia = options.idMultimedia;
      body = data || {};
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http.put(url, body, { headers }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Obtener lista de eventos desde la API
   */
  getEvents(options?: { token?: string }): Observable<any> {
  const url = `${this.baseUrl}/v1/eventos/filtrar`;
    let headers = new HttpHeaders();
    const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get(url, { headers }).pipe(catchError((err) => throwError(() => err)));
  }
}
