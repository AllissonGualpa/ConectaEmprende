import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EmprendimientoService {
    // Ajustar la URL para que sea v1/mi-emprendimiento/mis-emprendimientos
    private baseUrl = `${Environment.api_url}${Environment.api_mi_emprendimiento}`;

    constructor(private http: HttpClient) {}

    getMisEmprendimientos(): Observable<any> {
        const token = localStorage.getItem('token'); // ajusta la clave si es distinta
        const headers: { [header: string]: string } = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        return this.http.get(`${this.baseUrl}/mis-emprendimientos`, { headers });
    }

}