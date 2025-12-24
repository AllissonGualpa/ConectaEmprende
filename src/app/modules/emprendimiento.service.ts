import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SolicitudEmprendimientoDataDto } from './emprendedor/gestion-emprendedor/create-solicitud-emprendimiento/create-solicitud-emprendimiento.interfaces';
import { VistaEmprendedorDTO } from './admin/admin-solicitudes/solicitud3.service';

// ============================================
// INTERFACES
// ============================================

export interface EmprendimientosFilter {
    nombre?: string;
    tipo?: string;
    categoria?: string;
    ciudad?: string;
    page?: number;
    size?: number;
}

export interface TipoEmprendimiento {
    id: number;
    tipo: string;
    subTipo: string;
}

export interface EmprendimientoCrearResponse {
    mensaje: string;
    id: number;
}

export interface EmprendimientoAprobacionResponse {
    mensaje: string;
    estado: string;
    solicitudId: number;
}

export interface EmprendimientoPublico {
    id: number;
    nombreComercial: string;
    anioCreacion: string;
    activoEmprendimiento: boolean;
    aceptaDatosPublicos: boolean;
    fechaCreacion: string;
    fechaActualizacion: string | null;
    estadoEmprendimiento: string;
    usuarioId: number;
    nombreUsuario: string;
    ciudadId: number;
    nombreCiudad: string;
    tipoEmprendimientoId: number;
    nombreTipoEmprendimiento: string;
    categorias?: any[];
    descripciones?: {
        tipoDescripcion: string;
        descripcion: string;
        maxCaracteres: number;
        obligatorio: boolean;
        idEmprendimiento: number | null;
        emprendimientoId: number;
    }[];
    presenciasDigitales?: {
        emprendimientoId: number | null;
        plataforma: string;
        descripcion: string;
    }[];
    metricas?: {
        emprendimientoId: number;
        metricaId: number;
        valor: string;
    }[];
    declaracionesFinales?: {
        emprendimientoId: number;
        declaracionId: number;
        aceptada: boolean;
        fechaAceptacion: string;
        nombreFirma: string;
    }[];
    participacionesComunidad?: {
        emprendimientoId: number;
        opcionParticipacionId: number;
        respuesta: boolean;
        nombreOpcionParticipacion: string;
    }[];
    informacionRepresentante?: any;
    multimedia?: {
        id: number;
        urlArchivo: string;
        nombreActivo: string;
        tipo: string;
        mimeType: string | null;
        tamanoKb: number | null;
        fechaSubida: string | null;
    }[];
}



@Injectable({
    providedIn: 'root'
})
export class EmprendimientoService {
    private baseUrl = `${environment.api_url}${environment.api_mi_emprendimiento}`;
    private baseUrlEmprendimientos = `${environment.api_url}${environment.api_emprendimientos}`;

    constructor(private http: HttpClient) {}

    // ============================================
    // HELPER: Obtener headers con token
    // ============================================
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('accessToken') || 
                     localStorage.getItem('authToken');
        
        return token 
            ? new HttpHeaders({ Authorization: `Bearer ${token}` })
            : new HttpHeaders();
    }

    // ============================================
    // 1. CREAR EMPRENDIMIENTO (Completo)
    // ============================================
    /**
     * Crea un emprendimiento completo con todos sus datos
     * Estado resultante: PENDIENTE_APROBACION
     * 
     * @param data - Datos completos del emprendimiento
     * @param files - Archivos multimedia (logo, portada, galería)
     * @returns ID del emprendimiento creado
     */
    grabarEmprendimiento(
        data: SolicitudEmprendimientoDataDto,
        files: File[]
    ): Observable<EmprendimientoCrearResponse> {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        files.forEach(file => {
            formData.append('imagenes', file);
        });

        return this.http.post<EmprendimientoCrearResponse>(
            `${this.baseUrlEmprendimientos}`, 
            formData, 
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 2. CREAR BORRADOR
    // ============================================
    /**
     * Crea un borrador de emprendimiento (datos básicos)
     * Estado resultante: BORRADOR
     * 
     * @param data - Datos básicos del emprendimiento
     * @returns ID del borrador creado
     */
    crearBorrador(data: any): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(
            `${this.baseUrlEmprendimientos}/borrador`,
            data,
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 3. EDITAR EMPRENDIMIENTO
    // ============================================
    /**
     * Actualiza un emprendimiento existente
     * NO cambia el estado de publicación por sí solo
     * 
     * @param idEmprendimiento - ID del emprendimiento a editar
     * @param data - Datos actualizados
     * @param files - Nuevas imágenes (opcional)
     * @returns Confirmación de actualización
     */
    editarEmprendimiento(
        idEmprendimiento: number,
        data: SolicitudEmprendimientoDataDto,
        files: File[]
    ): Observable<EmprendimientoCrearResponse> { 
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        files.forEach(file => {
            formData.append('imagenes', file);
        });

        return this.http.put<EmprendimientoCrearResponse>(
            `${this.baseUrlEmprendimientos}/${idEmprendimiento}`, 
            formData, 
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 4. ENVIAR A APROBACIÓN
    // ============================================
    /**
     * Envía un emprendimiento para revisión del administrador
     * Crea una SolicitudAprobacion con estado PENDIENTE
     * 
     * Casos de uso:
     * - Emprendimiento nuevo → tipoSolicitud: CREACION
     * - Emprendimiento publicado → tipoSolicitud: ACTUALIZACION
     * 
     * @param emprendimientoId - ID del emprendimiento
     * @returns Estado de la solicitud y su ID
     */
    enviarAprobacion(emprendimientoId: number): Observable<EmprendimientoAprobacionResponse> {
        return this.http.post<EmprendimientoAprobacionResponse>(
            `${this.baseUrlEmprendimientos}/${emprendimientoId}/enviar-aprobacion`,
            {},
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 5. VER ESTADO Y OBSERVACIONES
    // ============================================
    /**
     * Obtiene la vista completa del emprendedor sobre su emprendimiento
     * Incluye: datos actuales, datos propuestos, estado, observaciones
     * 
     * @param emprendimientoId - ID del emprendimiento
     * @returns Vista completa con estados y observaciones
     */
    obtenerVistaEmprendedor(emprendimientoId: number): Observable<VistaEmprendedorDTO> {
        return this.http.get<VistaEmprendedorDTO>(
            `${environment.api_url}/api/solicitudes/emprendimiento/${emprendimientoId}/mi-vista`,
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 6. INACTIVAR/ACTIVAR EMPRENDIMIENTO
    // ============================================
    /**
     * Inactiva un emprendimiento (lo oculta del público)
     * 
     * @param emprendimientoId - ID del emprendimiento
     */
    inactivarEmprendimiento(emprendimientoId: number): Observable<void> {
        return this.http.put<void>(
            `${this.baseUrlEmprendimientos}/${emprendimientoId}/inactivar`,
            {},
            { headers: this.getHeaders() }
        );
    }

    /**
     * Activa un emprendimiento previamente inactivado
     * 
     * @param emprendimientoId - ID del emprendimiento
     */
    activarEmprendimiento(emprendimientoId: number): Observable<void> {
        return this.http.put<void>(
            `${this.baseUrlEmprendimientos}/${emprendimientoId}/activar`,
            {},
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 7. OBTENER EMPRENDIMIENTOS
    // ============================================
    /**
     * Obtiene lista de emprendimientos del usuario actual
     */
    getMisEmprendimientos(): Observable<any> {
        return this.http.get(
            `${this.baseUrl}/mis-emprendimientos`, 
            { headers: this.getHeaders() }
        );
    }

    /**
     * Obtiene emprendimientos con filtros (público)
     * 
     * @param filters - Filtros de búsqueda
     */
    getEmprendimientos(filters?: EmprendimientosFilter): Observable<any> {
        let params = new HttpParams();
        
        if (filters) {
            if (filters.nombre) params = params.set('nombre', filters.nombre);
            if (filters.tipo) params = params.set('tipo', filters.tipo);
            if (filters.categoria) params = params.set('categoria', filters.categoria);
            if (filters.ciudad) params = params.set('ciudad', filters.ciudad);
            if (filters.page !== undefined) params = params.set('page', filters.page.toString());
            if (filters.size !== undefined) params = params.set('size', filters.size.toString());
        }

        return this.http.get(`${this.baseUrlEmprendimientos}`, { params });
    }

    /**
     * Obtiene un emprendimiento público por ID
     * 
     * @param id - ID del emprendimiento
     */
    getEmprendimientoPublico(id: number): Observable<EmprendimientoPublico> {
        let token: string | null = null;

        if (typeof window !== 'undefined' && window.localStorage) {
            token = localStorage.getItem('token');
        }

        const headers: { [header: string]: string } = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        return this.http.get<EmprendimientoPublico>(
            `${this.baseUrlEmprendimientos}/${id}/publico`,
            { headers }
        );
    }

    /**
     * Obtiene un emprendimiento (vista admin)
     * 
     * @param id - ID del emprendimiento
     */
    getEmprendimientoAdmin(id: number): Observable<EmprendimientoPublico> {
        return this.http.get<EmprendimientoPublico>(
            `${this.baseUrlEmprendimientos}/${id}/publico`, 
            { headers: this.getHeaders() }
        );
    }

    // ============================================
    // 8. CATÁLOGOS
    // ============================================
    /**
     * Obtiene los tipos de emprendimiento disponibles
     */
    getTiposEmprendimiento(): Observable<TipoEmprendimiento[]> {
        return this.http.get<TipoEmprendimiento[]>(
            `${environment.api_url}${environment.api_tipos}`, 
            { headers: this.getHeaders() }
        );
    }
}