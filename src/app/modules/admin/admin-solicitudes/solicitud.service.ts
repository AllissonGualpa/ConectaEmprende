import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// ============================================
// INTERFACES
// ============================================

export interface Solicitud {
  id: number;
  emprendimientoId: number;
  nombreEmprendimiento: string;
  tipoSolicitud: 'CREACION' | 'ACTUALIZACION';
  estadoSolicitud: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'ENREVISION';
  datosPropuestos: any;
  datosOriginales: any | null;
  observaciones: string | null;
  motivoRechazo: string | null;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
  nombreSolicitante: string;
  nombreRevisor: string | null;
}

export interface SolicitudesResponse {
  content: Solicitud[];
  pageable: {
    length: number;
    lastPage: number;
    page: number;
    size: number;
  };
}

export interface VistaEmprendedorDTO {
  datosActuales: any;
  datosPropuestos: any;
  estadoEmprendimiento: string;
  estadoSolicitud: string | null;
  observaciones: string | null;
  motivoRechazo: string | null;
  tieneSolicitudActiva: boolean;
  solicitudId: number | null;
}

export interface SolicitudDetalleDTO {
  solicitud: Solicitud;
  datosActuales: any;
  datosPropuestos: any;
  diferencias: any;
}

export interface SolicitudHistorialDTO {
  solicitudId: number;
  historial: {
    fecha: string;
    accion: string;
    usuario: string;
    observaciones: string | null;
  }[];
}

export interface SolicitudResponse {
  mensaje: string;
  solicitudId: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private baseApiUrl = `${environment.api_url}${environment.api_solicitudes}`;

  constructor(private http: HttpClient) {}

  // ============================================
  // HELPER: Obtener headers con token
  // ============================================
  private getHeaders(options?: { token?: string }): HttpHeaders {
    let headers = new HttpHeaders();
    
    const token =
      options?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // ============================================
  // APIs DEL EMPRENDEDOR
  // ============================================

  /**
   * 1. Enviar emprendimiento a revisión (crear solicitud)
   * Crea una solicitud con los datos completos del emprendimiento
   * 
   * @param emprendimientoId - ID del emprendimiento
   * @param datosCompletos - Datos completos del emprendimiento (opcional, si no se envía el backend los captura)
   * @param options - Opciones adicionales (token)
   */
  enviarSolicitudEmprendimiento(
    emprendimientoId: number,
    datosCompletos?: any,
    options?: { token?: string }
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/enviar`;
    const body = datosCompletos || {};
    return this.http.post<SolicitudResponse>(url, body, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 2. Ver estado del emprendimiento (vista emprendedor)
   * Obtiene el estado completo del emprendimiento incluyendo solicitudes activas
   * 
   * @param emprendimientoId - ID del emprendimiento
   * @param options - Opciones adicionales (token)
   */
  obtenerVistaEmprendedor(
    emprendimientoId: number,
    options?: { token?: string }
  ): Observable<VistaEmprendedorDTO> {
    const url = `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/mi-vista`;
    return this.http.get<VistaEmprendedorDTO>(url, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 3. Modificar y reenviar solicitud con observaciones
   * Usado cuando el admin envió observaciones (estado ENREVISION)
   * 
   * @param solicitudId - ID de la solicitud
   * @param datosCorregidos - Datos corregidos según observaciones
   * @param options - Opciones adicionales (token)
   */
  modificarYReenviarSolicitud(
    solicitudId: number,
    datosCorregidos: any,
    options?: { token?: string }
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/${solicitudId}/modificar-reenviar`;
    return this.http.put<SolicitudResponse>(url, datosCorregidos, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * Enviar solicitud de ACTUALIZACIÓN para emprendimiento PUBLICADO
   * 
   * @param emprendimientoId - ID del emprendimiento
   * @param datosActualizados - Datos actualizados
   * @param options - Opciones adicionales (token)
   */
  enviarSolicitudActualizacion(
    emprendimientoId: number,
    datosActualizados: any,
    options?: { token?: string }
  ): Observable<any> {
    const url = `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/enviar`;
    return this.http.post(url, datosActualizados, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  // ============================================
  // APIs DEL ADMINISTRADOR
  // ============================================

  /**
   * 4. Listar solicitudes pendientes (dashboard admin)
   * Obtiene todas las solicitudes con estado PENDIENTE
   * 
   * @param params - Parámetros de paginación y filtros
   */
  getSolicitudesPendientes(params?: {
    page?: number;
    size?: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    token?: string;
  }): Observable<SolicitudesResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.fechaInicio) httpParams = httpParams.set('fechaInicio', params.fechaInicio);
      if (params.fechaFin) httpParams = httpParams.set('fechaFin', params.fechaFin);
    }

    const url = `${this.baseApiUrl}/admin/pendientes`;
    return this.http.get<SolicitudesResponse>(url, { 
      headers: this.getHeaders(params),
      params: httpParams 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 5. Ver detalle de solicitud con comparación
   * Obtiene los datos propuestos vs datos actuales
   * 
   * @param solicitudId - ID de la solicitud
   * @param options - Opciones adicionales (token)
   */
  obtenerDetalleSolicitud(
    solicitudId: number,
    options?: { token?: string }
  ): Observable<SolicitudDetalleDTO> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/detalle`;
    return this.http.get<SolicitudDetalleDTO>(url, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 6. Ver historial de la solicitud
   * Obtiene todas las acciones realizadas sobre la solicitud
   * 
   * @param solicitudId - ID de la solicitud
   * @param options - Opciones adicionales (token)
   */
  obtenerHistorialSolicitud(
    solicitudId: number,
    options?: { token?: string }
  ): Observable<SolicitudHistorialDTO> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/historial`;
    return this.http.get<SolicitudHistorialDTO>(url, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 7. Aprobar solicitud
   * Aplica los cambios propuestos al emprendimiento y lo publica
   * 
   * @param solicitudId - ID de la solicitud
   * @param options - Opciones adicionales (token)
   */
  aprobarSolicitud(
    solicitudId: number,
    options?: { token?: string }
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/aprobar`;
    return this.http.post<SolicitudResponse>(url, {}, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 8. Rechazar solicitud
   * Rechaza la solicitud con un motivo
   * 
   * @param solicitudId - ID de la solicitud
   * @param motivo - Motivo del rechazo
   * @param options - Opciones adicionales (token)
   */
  rechazarSolicitud(
    solicitudId: number,
    motivo: string,
    options?: { token?: string }
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/rechazar`;
    const body = { motivo };
    return this.http.post<SolicitudResponse>(url, body, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  /**
   * 9. Enviar observaciones
   * Envía observaciones al emprendedor para que corrija
   * Cambia el estado a ENREVISION
   * 
   * @param solicitudId - ID de la solicitud
   * @param observaciones - Observaciones para el emprendedor
   * @param options - Opciones adicionales (token)
   */
  enviarObservaciones(
    solicitudId: number,
    observaciones: string,
    options?: { token?: string }
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/observaciones`;
    const body = { observaciones };
    return this.http.post<SolicitudResponse>(url, body, { 
      headers: this.getHeaders(options) 
    }).pipe(
      catchError((err) => throwError(() => err))
    );
  }

  // ============================================
  // MÉTODOS AUXILIARES (compatibilidad)
  // ============================================

  /**
   * Método genérico para obtener solicitudes (compatibilidad)
   * Usa getSolicitudesPendientes internamente
   */
  getSolicitudes(params: {
    page: number;
    size: number;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    token?: string;
  }): Observable<SolicitudesResponse | Solicitud[]> {
    return this.getSolicitudesPendientes(params);
  }
}