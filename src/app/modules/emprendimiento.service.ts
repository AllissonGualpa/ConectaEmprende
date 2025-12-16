import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

import { Environment } from '../../environments/environment';
import { SolicitudEmprendimientoDataDto } from './emprendedor/gestion-emprendedor/create-solicitud-emprendimiento/create-solicitud-emprendimiento.interfaces';

@Injectable({
    providedIn: 'root'
})
export class EmprendimientoService {
    private baseUrl = `${Environment.api_url}${Environment.api_mi_emprendimiento}`;
    private baseUrlEmprendimientos = `${Environment.api_url}${Environment.api_emprendimientos}`;

    constructor(private http: HttpClient) {}

    getMisEmprendimientos(): Observable<any> {
        const token = localStorage.getItem('token');
        const headers: { [header: string]: string } = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        return this.http.get(`${this.baseUrl}/mis-emprendimientos`, { headers });
    }

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
     * Graba (crea / actualiza) un emprendimiento enviando:
     * - data: JSON con la estructura SolicitudEmprendimientoDataDto
     * - imagenes: arreglo de archivos (multipart/form-data)
     */
    grabarEmprendimiento(
        data: SolicitudEmprendimientoDataDto,
        files: File[]
    ): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders(
            token ? { Authorization: `Bearer ${token}` } : {}
        );

        const formData = new FormData();

        // Parte JSON (nombre EXACTO que espera tu API)
        formData.append('data', JSON.stringify(data));

        // Partes de archivo (campo imágenes múltiple)
        files.forEach(file => {
            formData.append('imagenes', file); // mismo nombre repetido para cada archivo
        });

        return this.http.post(`${this.baseUrlEmprendimientos}`, formData, {
            headers, // NO se setea Content-Type manualmente
        });
    }

    getTiposEmprendimiento(): Observable<TipoEmprendimiento[]> {
        const token = localStorage.getItem('token');
        const headers: { [header: string]: string } = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        return this.http.get<TipoEmprendimiento[]>(`${Environment.api_url}${Environment.api_tipos}`, { headers });
    }

    getEmprendimientoPublico(id: number): Observable<EmprendimientoPublico> {
        const token = localStorage.getItem('token');
        const headers: { [header: string]: string } = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        return this.http.get<EmprendimientoPublico>(`${this.baseUrlEmprendimientos}/${id}/publico`, { headers });
    }

    //falta api para editar emprendimiento
    //falta api para inactivar emprendimiento
}