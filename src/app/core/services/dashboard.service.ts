import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  EmprendimientoMenosVisto, 
  EmprendimientoTop, 
  CategoriaConVistas, 
  RankingGlobalDTO,
  CategoriaMasVistaResponse
} from '../types/dashboard.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = environment.api_url;

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
  // EMPRENDIMIENTOS MENOS VISTOS
  // ============================
  getEmprendimientosMenosVistos(): Observable<EmprendimientoMenosVisto[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimientos/menos-vistos`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<EmprendimientoMenosVisto>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // TOP EMPRENDIMIENTOS (MÁS VISTOS)
  // ============================
  getTopEmprendimientos(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimientos/mas-vistos`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<EmprendimientoTop>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // MEJOR VALORADOS (ASC)
  // ============================
  getEmprendimientosMejorValorados(): Observable<RankingGlobalDTO[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/valoracion/asc`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<RankingGlobalDTO>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // PEOR VALORADOS (DESC)
  // ============================
  getEmprendimientosPeorValorados(): Observable<RankingGlobalDTO[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/valoracion/desc`;

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      map(res => this.normalizarArray<RankingGlobalDTO>(res)),
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // CATEGORÍA MÁS VISTA
  // ============================
  getCategoriasMasVistas(): Observable<CategoriaConVistas[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/categoria/mayor-vista`;

    return this.http
      .get<CategoriaMasVistaResponse>(url, { headers: this.getHeaders() })
      .pipe(
        map(res => res.categorias ?? []),
        catchError(err => throwError(() => err))
      );
  }

  // ============================
  // RANKING POR PREGUNTA AUTOEVALUACIÓN
  // ============================
  getRankingPorPregunta(
    idPregunta: number, 
    idTipoEmprendimiento?: number,
    page: number = 0, 
    size: number = 20
  ): Observable<any> {
    let url = `${this.baseUrl}/v1/metricas-generales/pregunta/${idPregunta}?page=${page}&size=${size}`;
    
    // Solo agregar el parámetro si es un número válido (no null, undefined, NaN o string)
    if (idTipoEmprendimiento !== undefined && 
        idTipoEmprendimiento !== null && 
        typeof idTipoEmprendimiento === 'number' &&
        !isNaN(idTipoEmprendimiento)) {
      url += `&idTipoEmprendimiento=${idTipoEmprendimiento}`;
    }

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // OBTENER FORMULARIO DE AUTOEVALUACIÓN
  // ============================
  obtenerFormularioAutoevaluacion(): Observable<any> {
    const url = `${this.baseUrl}/v1/formularios/tipo/AUTOEVALUACION`;
    
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  obtenerFormularioServicio(): Observable<any> {
    const url = `${this.baseUrl}/v1/formularios/tipo/EVALUACION_SERVICIO`;
    
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  obtenerFormularioProducto(): Observable<any> {
    const url = `${this.baseUrl}/v1/formularios/tipo/EVALUACION_PRODUCTO`;
    
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // ============================
  // TODOS LOS EMPRENDIMIENTOS
  // ============================
  getTodosEmprendimientos(): Observable<any[]> {
    const url = `${this.baseUrl}${environment.api_emprendimientos}`;

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