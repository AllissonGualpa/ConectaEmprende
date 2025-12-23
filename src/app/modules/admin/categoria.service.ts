import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Categoria } from '../../models/categoria.interface';

@Injectable({ providedIn: 'root' })
export class CategoriaService {

    private baseUrl = environment.api_url + environment.api_categorias;

    constructor(private http: HttpClient) { }

    /**
     * Obtener lista de categorias desde la API.
     * Endpoint: /v1/categorias
     */
    getCategorias(): Observable<Categoria[]> {
        const url = `${this.baseUrl}`;
        return this.http
            .get<Categoria[]>(url)
            .pipe(catchError((err) => throwError(() => err)));
    }
}
