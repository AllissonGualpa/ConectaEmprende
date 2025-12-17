import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

// Interfaces
export interface EmprendimientoMenosVisto {
  id: number;
  nombre: string;
  categoria: string;
  visitas: number;
  iniciales?: string;
}

export interface EmprendimientoTop {
  id: number;
  nombre: string;
  categoria: string;
  calificacion?: number;
  visitas?: number;
  iniciales?: string;
}

export interface CategoriaMasVista {
  nombre: string;
  visitas: number;
  ejemplo?: string;
}

export interface PreguntaAutoevaluacion {
  pregunta: string;
  promedio: number;
}

export interface MetricasGenerales {
  totalUsuarios: number;
  totalEmprendimientos: number;
  totalVisitas: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = Environment.api_url;

  constructor(private http: HttpClient) {}

  //token
  private getHeaders(): HttpHeaders {
  let headers = new HttpHeaders();

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken');

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

  //helper para normalizar arrays
  private normalizarArray<T>(res: any): T[] {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.content && Array.isArray(res.content)) return res.content;
    return [];
  }

  //helper para normalizar objeto
  private normalizarObjeto<T>(res: any, fallback: T): T {
    return res ?? fallback;
  }

  // ============================
  // metricas generales
  // ============================
  getMetricasGenerales(): Observable<MetricasGenerales> {
    const url = `${this.baseUrl}/v1/metricas-generales`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarObjeto(res, {
        totalUsuarios: 0,
        totalEmprendimientos: 0,
        totalVisitas: 0
      })),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // EMPRENDIMIENTOS MENOS VISTOS
  // ============================
  getEmprendimientosMenosVistos(): Observable<EmprendimientoMenosVisto[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/menor-vista`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<EmprendimientoMenosVisto>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // TOP EMPRENDIMIENTOS
  // ============================
  getTopEmprendimientos(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/mayor-vista`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<EmprendimientoTop>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // MEJOR VALORADOS
  // ============================
  getEmprendimientosMejorValorados(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/mayor-valoracion`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<EmprendimientoTop>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // PEOR VALORADOS
  // ============================
  getEmprendimientosPeorValorados(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/menor-valoracion`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<EmprendimientoTop>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // CATEGORÍA MÁS VISTA
  // ============================
  getCategoriaMasVista(): Observable<CategoriaMasVista> {
    const url = `${this.baseUrl}/v1/metricas-generales/categoria/mayor-vista`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarObjeto(res, {
        nombre: '',
        visitas: 0,
        ejemplo: ''
      })),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // PREGUNTAS AUTOEVALUACIÓN
  // ============================
  getPreguntasAutoevaluacion(emprendimientoId?: number, fecha?: string): Observable<PreguntaAutoevaluacion[]> {
    let url = `${this.baseUrl}/v1/metricas-generales/preguntas-autoevaluacion`;
    const params: string[] = [];

    if (emprendimientoId) params.push(`emprendimientoId=${emprendimientoId}`);
    if (fecha) params.push(`fecha=${fecha}`);
    if (params.length) url += '?' + params.join('&');

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<PreguntaAutoevaluacion>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // TODOS LOS EMPRENDIMIENTOS
  // ============================
  getTodosEmprendimientos(): Observable<any[]> {
    const url = `${this.baseUrl}${Environment.api_emprendimientos}`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<any>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // INICIALES
  // ============================
  generarIniciales(nombre: string): string {
    if (!nombre) return '??';
    return nombre
      .split(' ')
      .map(w => w.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}