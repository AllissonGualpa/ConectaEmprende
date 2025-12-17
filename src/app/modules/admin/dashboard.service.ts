import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

// Interfaces para tipar las respuestas
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
  // Usar Environment.api_url base (sin ruta adicional por ahora)
  private baseUrl = Environment.api_url;

  constructor(private http: HttpClient) {}

  // MISMO PATRÓN que evento.service para obtener headers con token
  private getHeaders(): HttpHeaders {
    const token = 
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken') ||
      '';
    
    console.log('🔑 Dashboard - Token encontrado:', token ? 'Sí (' + token.substring(0, 20) + '...)' : 'No');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Métricas generales
  getMetricasGenerales(): Observable<MetricasGenerales> {
    const url = `${this.baseUrl}/v1/metricas-generales`;
    console.log('📊 Llamando a:', url);
    return this.http.get<MetricasGenerales>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getMetricasGenerales:', err);
        return throwError(() => err);
      })
    );
  }

  // Emprendimientos menos vistos
  getEmprendimientosMenosVistos(): Observable<EmprendimientoMenosVisto[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/menor-vista`;
    console.log('📊 Llamando a:', url);
    return this.http.get<EmprendimientoMenosVisto[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getEmprendimientosMenosVistos:', err);
        return throwError(() => err);
      })
    );
  }

  // Top emprendimientos (mayor vista)
  getTopEmprendimientos(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/mayor-vista`;
    console.log('📊 Llamando a:', url);
    return this.http.get<EmprendimientoTop[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getTopEmprendimientos:', err);
        return throwError(() => err);
      })
    );
  }

  // Emprendimientos mejor valorados
  getEmprendimientosMejorValorados(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/mayor-valoracion`;
    console.log('📊 Llamando a:', url);
    return this.http.get<EmprendimientoTop[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getEmprendimientosMejorValorados:', err);
        return throwError(() => err);
      })
    );
  }

  // Emprendimientos peor valorados
  getEmprendimientosPeorValorados(): Observable<EmprendimientoTop[]> {
    const url = `${this.baseUrl}/v1/metricas-generales/emprendimiento/menor-valoracion`;
    console.log('📊 Llamando a:', url);
    return this.http.get<EmprendimientoTop[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getEmprendimientosPeorValorados:', err);
        return throwError(() => err);
      })
    );
  }

  // Categoría más vista
  getCategoriaMasVista(): Observable<CategoriaMasVista> {
    const url = `${this.baseUrl}/v1/metricas-generales/categoria/mayor-vista`;
    console.log('📊 Llamando a:', url);
    return this.http.get<CategoriaMasVista>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getCategoriaMasVista:', err);
        return throwError(() => err);
      })
    );
  }

  // Preguntas de autoevaluación
  getPreguntasAutoevaluacion(emprendimientoId?: number, fecha?: string): Observable<PreguntaAutoevaluacion[]> {
    let url = `${this.baseUrl}/v1/metricas-generales/preguntas-autoevaluacion`;
    const params: string[] = [];
    
    if (emprendimientoId) {
      params.push(`emprendimientoId=${emprendimientoId}`);
    }
    if (fecha) {
      params.push(`fecha=${fecha}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    console.log('📊 Llamando a:', url);
    return this.http.get<PreguntaAutoevaluacion[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getPreguntasAutoevaluacion:', err);
        return throwError(() => err);
      })
    );
  }

  // Obtener todos los emprendimientos para el filtro
  getTodosEmprendimientos(): Observable<any[]> {
    // Usar la misma ruta que tienes en Environment
    const url = `${this.baseUrl}${Environment.api_emprendimientos}`;
    console.log('📊 Llamando a:', url);
    return this.http.get<any[]>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError((err) => {
        console.error('❌ Error en getTodosEmprendimientos:', err);
        return throwError(() => err);
      })
    );
  }

  // Helper para generar iniciales
  generarIniciales(nombre: string): string {
    if (!nombre) return '??';
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}