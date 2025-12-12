import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

        // El backend requiere la parte 'data'
        formData.append('data', JSON.stringify(data));

        // Archivos asociados (logo, fotos, banner, video, etc.)
        files.forEach(file => {
            formData.append('imagenes', file);
        });

        return this.http.post(`${this.baseUrlEmprendimientos}`, formData, {
            headers,
        });
    }
}