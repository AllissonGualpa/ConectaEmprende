import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

// DTOs para /admin
export interface AdminEventoItemDto {
    idEvento: number;
    titulo: string;
    idEmprendimiento: number;
    nombreEmprendimiento: string;
    fechaEvento: string;      // ISO
    fechaCreacion: string;    // ISO
    estadoEvento: string;     // 'programado', etc.
    tipoEvento: string;       // 'presencial', etc.
    activo: boolean;
}

export interface AdminEventosPageableDto {
    length: number;
    size: number;
    page: number;
    lastPage: number;
}

export interface AdminEventosResponseDto {
    content: AdminEventoItemDto[];
    pageable: AdminEventosPageableDto;
}

@Injectable({ providedIn: 'root' })
export class EventoService {

    private baseUrl = Environment.api_url + Environment.api_eventos;

    constructor(private http: HttpClient) { }

    /**
     * Crea un evento en la API.
     * data puede ser JSON o FormData (si incluye imagen binaria).
     */
    createEvent(
        data: any,
        options?: { idEmprendimiento?: number; idMultimedia?: number; token?: string; isFormData?: boolean }
    ): Observable<any> {
        const idEmp = options?.idEmprendimiento;
        const url = `${this.baseUrl}/crear` + (idEmp ? `?idEmprendimiento=${idEmp}` : '');

        let headers = new HttpHeaders();

        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        if (!options?.isFormData) {
            headers = headers.set('Content-Type', 'application/json');
        }

        return this.http.post(url, data, { headers }).pipe(
            catchError((err) => throwError(() => err))
        );
    }


    /**
     * Inactiva (desactiva) un evento en la API (ADMIN).
     * Endpoint: /v1/eventos/admin/:idEvento/desactivar
     */
    inactivateEvent(idEvento: string | number, options?: { token?: string }): Observable<any> {
        const url = `${this.baseUrl}/admin/${idEvento}/desactivar`;
        let headers = new HttpHeaders();
        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http
            .put(url, {}, { headers, responseType: 'text' })
            .pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * endpoint: /v1/eventos//:idEvento/cancelar
     */
    cancelEvent(
        idEvento: string | number,
        options?: { token?: string }
    ): Observable<any> {
        const url = `${this.baseUrl}/${idEvento}/cancelar`;

        let headers = new HttpHeaders();

        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        // Normalmente no se envía body para cancelar; si tu API lo requiere, pásalo aquí.
        return this.http.put(url, {}, { headers }).pipe(
            catchError((err) => throwError(() => err))
        );
    }


    /**
     * Activa (reactiva) un evento en la API (ADMIN).
     * Endpoint: /v1/eventos/admin/:idEvento/activar
     */
    activateEvent(idEvento: string | number, options?: { token?: string }): Observable<any> {
        const url = `${this.baseUrl}/admin/${idEvento}/activar`;
        let headers = new HttpHeaders();
        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http
            .put(url, {}, { headers, responseType: 'text' })
            .pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * Edita un evento existente en la API.
     * Endpoint: /v1/eventos/editar/:idEvento
     * data puede ser JSON o FormData (si incluye imagen binaria).
     */
    editEvent(
        idEvento: string | number,
        data: any,
        options?: { token?: string; isFormData?: boolean }
    ): Observable<any> {
        const url = `${this.baseUrl}/editar/${idEvento}`;

        let headers = new HttpHeaders();
        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        // Solo seteamos Content-Type si NO es FormData
        if (!options?.isFormData) {
            headers = headers.set('Content-Type', 'application/json');
        }

        return this.http.put(url, data || {}, { headers }).pipe(
            catchError((err) => throwError(() => err))
        );
    }

    /**
     * Obtener lista de eventos desde la API (ADMIN) con paginación.
     * Endpoint: /v1/eventos/filtrar?page=0&size=10
     */
    getEvents(options?: { page?: number; size?: number; token?: string }): Observable<any> {
        const url = `${this.baseUrl}/filtrar`;
        let headers = new HttpHeaders();
        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        let params = new HttpParams();
        if (options?.page != null) {
            params = params.set('page', String(options.page));
        }
        if (options?.size != null) {
            params = params.set('size', String(options.size));
        }

        return this.http
            .get(url, { headers, params })
            .pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * Obtener eventos públicos paginados.
     * Endpoint: /v1/eventos/publico?mes=11&page=0&size=10
     */
    getPublicEvents(options?: { mes?: number; page?: number; size?: number; token?: string }): Observable<any> {
        const url = `${this.baseUrl}/publico`;
        let headers = new HttpHeaders();
        const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        let params = new HttpParams();
        if (options?.mes != null) params = params.set('mes', String(options.mes));
        if (options?.page != null) params = params.set('page', String(options.page));
        if (options?.size != null) params = params.set('size', String(options.size));

        return this.http.get(url, { headers, params }).pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * Obtener eventos asociados al emprendedor (paginado).
     * Endpoint: /v1/eventos/emprendedor?page=0&size=5
     */
    getEmprendedorEvents(options?: {
        page?: number;
        size?: number;
        titulo?: string;
        fechaInicio?: string;   // ISO: 2025-12-19T14:44:00
        fechaFin?: string;      // ISO
        estado?: string;        // debe coincidir con enum EstadoEvento
        tipoEvento?: string;    // debe coincidir con enum TipoEvento
        idEmprendimiento?: number;
        token?: string;
    }): Observable<any> {
        const url = `${this.baseUrl}/emprendedor`;

        let headers = new HttpHeaders();
        const token =
            options?.token ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        let params = new HttpParams();

        if (options?.page != null) params = params.set('page', String(options.page));
        if (options?.size != null) params = params.set('size', String(options.size));
        if (options?.titulo) params = params.set('titulo', options.titulo);
        if (options?.fechaInicio) params = params.set('fechaInicio', options.fechaInicio);
        if (options?.fechaFin) params = params.set('fechaFin', options.fechaFin);
        if (options?.estado) params = params.set('estado', options.estado);
        if (options?.tipoEvento) params = params.set('tipoEvento', options.tipoEvento);
        if (options?.idEmprendimiento != null)
            params = params.set('idEmprendimiento', String(options.idEmprendimiento));

        return this.http.get(url, { headers, params }).pipe(
            catchError((err) => throwError(() => err))
        );
    }


    /**
     * Obtener eventos para el administrador con filtros y paginación.
     * Respuesta tipada con AdminEventosResponseDto.
     */
    getAdminEvents(options?: { estado?: string; fechaInicio?: string; fechaFin?: string; page?: number; size?: number; token?: string }): Observable<AdminEventosResponseDto> {
        const url = `${this.baseUrl}/admin`;
        let headers = new HttpHeaders();
        const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        let params = new HttpParams();
        if (options?.estado) params = params.set('estado', String(options.estado).toLowerCase());
        if (options?.fechaInicio) params = params.set('fechaInicio', options.fechaInicio);
        if (options?.fechaFin) params = params.set('fechaFin', options.fechaFin);
        if (options?.page != null) params = params.set('page', String(options.page));
        if (options?.size != null) params = params.set('size', String(options.size));

        return this.http.get<AdminEventosResponseDto>(url, { headers, params }).pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * Obtener un evento público por id.
     * Endpoint: /v1/eventos/publico/:id
     */
    getEventById(id: string | number, options?: { token?: string }): Observable<any> {
        const url = `${this.baseUrl}/publico/${id}`;
        return this.http
            .get(url)
            .pipe(catchError((err) => throwError(() => err)));
    }

    getEventByIdAdmin(id: string | number, options?: { token?: string }): Observable<any> {
        const url = `${this.baseUrl}/admin/${id}`;
        let headers = new HttpHeaders();
        const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http
            .get(url, { headers })
            .pipe(catchError((err) => throwError(() => err)));
    }

    /**
     * Obtener un evento específico del emprendedor por ID.
     * Endpoint: /v1/eventos/emprendedor/:idEvento
     */
    getEmprendedorEventById(idEvento: string | number, options?: { token?: string }): Observable<any> {
        const url = `${this.baseUrl}/emprendedor/${idEvento}`;
        let headers = new HttpHeaders();
        const token = options?.token || localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http
            .get(url, { headers })
            .pipe(catchError((err) => throwError(() => err)));
    }
}
