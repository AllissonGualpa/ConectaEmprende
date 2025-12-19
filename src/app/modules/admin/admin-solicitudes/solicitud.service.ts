import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../../environments/environment';

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
  private baseApiUrl = `${Environment.api_url}${Environment.api_solicitudes}`;

  constructor(private http: HttpClient) {}

  // ============================================
  // HELPER: Obtener headers con token
  // ============================================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('accessToken') || 
                 localStorage.getItem('authToken');
    
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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
   */
  enviarSolicitudEmprendimiento(
    emprendimientoId: number,
    datosCompletos?: any
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/enviar`;
    const body = datosCompletos || {};
    return this.http.post<SolicitudResponse>(url, body, { headers: this.getHeaders() });
  }

  /**
   * 2. Ver estado del emprendimiento (vista emprendedor)
   * Obtiene el estado completo del emprendimiento incluyendo solicitudes activas
   * 
   * @param emprendimientoId - ID del emprendimiento
   */
  obtenerVistaEmprendedor(emprendimientoId: number): Observable<VistaEmprendedorDTO> {
    const url = `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/mi-vista`;
    return this.http.get<VistaEmprendedorDTO>(url, { headers: this.getHeaders() });
  }

  /**
   * 3. Modificar y reenviar solicitud con observaciones
   * Usado cuando el admin envió observaciones (estado ENREVISION)
   * 
   * @param solicitudId - ID de la solicitud
   * @param datosCorregidos - Datos corregidos según observaciones
   */
  modificarYReenviarSolicitud(
    solicitudId: number,
    datosCorregidos: any
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/${solicitudId}/modificar-reenviar`;
    return this.http.put<SolicitudResponse>(url, datosCorregidos, { headers: this.getHeaders() });
  }

  /**
 * Enviar solicitud de ACTUALIZACIÓN para emprendimiento PUBLICADO
 */
enviarSolicitudActualizacion(emprendimientoId: number, datosActualizados: any): Observable<any> {
  return this.http.post(
    `${this.baseApiUrl}/emprendimiento/${emprendimientoId}/enviar`,
    datosActualizados
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
      headers: this.getHeaders(),
      params: httpParams 
    });
  }

  /**
   * 5. Ver detalle de solicitud con comparación
   * Obtiene los datos propuestos vs datos actuales
   * 
   * @param solicitudId - ID de la solicitud
   */
  obtenerDetalleSolicitud(solicitudId: number): Observable<SolicitudDetalleDTO> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/detalle`;
    return this.http.get<SolicitudDetalleDTO>(url, { headers: this.getHeaders() });
  }

  /**
   * 6. Ver historial de la solicitud
   * Obtiene todas las acciones realizadas sobre la solicitud
   * 
   * @param solicitudId - ID de la solicitud
   */
  obtenerHistorialSolicitud(solicitudId: number): Observable<SolicitudHistorialDTO> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/historial`;
    return this.http.get<SolicitudHistorialDTO>(url, { headers: this.getHeaders() });
  }

  /**
   * 7. Aprobar solicitud
   * Aplica los cambios propuestos al emprendimiento y lo publica
   * 
   * @param solicitudId - ID de la solicitud
   */
  aprobarSolicitud(solicitudId: number): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/aprobar`;
    return this.http.post<SolicitudResponse>(url, {}, { headers: this.getHeaders() });
  }

  /**
   * 8. Rechazar solicitud
   * Rechaza la solicitud con un motivo
   * 
   * @param solicitudId - ID de la solicitud
   * @param motivo - Motivo del rechazo
   */
  rechazarSolicitud(
    solicitudId: number,
    motivo: string
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/rechazar`;
    const body = { motivo };
    return this.http.post<SolicitudResponse>(url, body, { headers: this.getHeaders() });
  }

  /**
   * 9. Enviar observaciones
   * Envía observaciones al emprendedor para que corrija
   * Cambia el estado a ENREVISION
   * 
   * @param solicitudId - ID de la solicitud
   * @param observaciones - Observaciones para el emprendedor
   */
  enviarObservaciones(
    solicitudId: number,
    observaciones: string
  ): Observable<SolicitudResponse> {
    const url = `${this.baseApiUrl}/admin/${solicitudId}/observaciones`;
    const body = { observaciones };
    return this.http.post<SolicitudResponse>(url, body, { headers: this.getHeaders() });
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
  }): Observable<SolicitudesResponse | Solicitud[]> {
    return this.getSolicitudesPendientes(params);
  }
}