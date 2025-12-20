import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag, BlogCreate, BlogArticle, AdminBlog, PaginatedResponse } from './blog.types';
import { Environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private baseApiUrl = Environment.api_url + Environment.api_blog;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Obtener todos los tags
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseApiUrl}/tags`, { headers: this.getHeaders() });
  }

  // Obtener artículos con filtros/paginación
  getBlogs(params: {
    page: number;
    size: number;
    tag?: string;
    titulo?: string;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Observable<PaginatedResponse<AdminBlog> | AdminBlog[]> {
    const { page, size, tag, estado, titulo, fechaInicio, fechaFin } = params;
    const inicio = fechaInicio || '2024-01-01';
    const fin = fechaFin || '2025-12-31';

    let url = `${this.baseApiUrl}/admin/articulos?page=${page}&size=${size}`;
    url += `&fechaInicio=${this.formatDate(inicio, false)}`;
    url += `&fechaFin=${this.formatDate(fin, true)}`;

    if (tag) url += `&idTag=${tag}`;
    if (titulo) url += `&titulo=${titulo}`;
    if (estado) url += `&estado=${estado}`;

    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Obtener un artículo por id (admin)
  getArticleById(blogId: number): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/admin/articulos/${blogId}`, { headers: this.getHeaders() });
  }

  // Obtener un artículo público por id
  getPublicArticleById(id: number): Observable<BlogArticle> {
    const url = `${this.baseApiUrl}/publico/articulos/${id}`;
    return this.http.get<BlogArticle>(url, { headers: this.getOptionalHeaders() });
  }

  // Actualizar artículo
  updateArticle(blogId: number, payload: any, userId?: number): Observable<any> {
    const uid = userId ?? Number(localStorage.getItem('idUsuario') || '1');
    return this.http.put(`${this.baseApiUrl}/articulos/${blogId}?idUsuario=${uid}`, payload, {
      headers: this.getHeaders()
    });
  }

  // Acción genérica (archivar/desarchivar/otras)
  toggleArchiveBlog(blogId: number, action: 'archivar' | 'desarchivar', userId?: number): Observable<any> {
    const uid = userId ?? Number(localStorage.getItem('idUsuario') || '1');
    return this.http.put(
      `${this.baseApiUrl}/articulos/${blogId}/${action}?idUsuario=${uid}`,
      {},
      { headers: this.getHeaders(), responseType: 'text' }
    );
  }

  // Eliminar artículo
  deleteArticle(blogId: number, userId?: number): Observable<any> {
    const uid = userId ?? Number(localStorage.getItem('idUsuario') || '1');
    return this.http.delete(`${this.baseApiUrl}/articulos/${blogId}?idUsuario=${uid}`, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    });
  }

  // Crear tag (admin)
  createTag(nombre: string): Observable<any> {
    const idUsuario = localStorage.getItem('idUsuario') || '1';
    return this.http.post(`${this.baseApiUrl}/tags/crear?idUsuario=${idUsuario}`, { nombre }, { headers: this.getHeaders() });
  }

  // Subir imagen
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // no manipular Content-Type; HttpClient lo asigna con boundary
    return this.http.post(`${this.baseApiUrl}/imagenes/subir`, formData, {
      headers: this.getHeaders()
    });
  }

  // Crear artículo
  createBlog(blog: BlogCreate): Observable<any> {
    const idUsuario = localStorage.getItem('idUsuario') || '1';
    const formData = new FormData();
    formData.append('titulo', blog.titulo);
    formData.append('descripcionCorta', blog.resumen);
    formData.append('contenido', blog.contenido);
    formData.append('estado', 'PUBLICADO');

    const nombresTags = blog.tags.map(t => t.nombre).join(',');
    const idsTags = blog.tags.map(t => t.idTag).join(',');
    formData.append('nombresTags', nombresTags || 'sin-tag');
    formData.append('idsTags', idsTags || '');
    if (blog.imagenDestacada) formData.append('imagen', blog.imagenDestacada);

    return this.http.post(`${this.baseApiUrl}/articulos/crear?idUsuario=${idUsuario}`, formData, { headers: this.getHeaders() });
  }

  // Helper que devuelve headers solo si hay token (para endpoints públicos que aceptan o no auth)
  private getOptionalHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // Obtener artículos públicos (paginados) — usado por la landing
  getPublicArticles(params?: { fechaInicio?: string; page?: number; size?: number; idTag?: number }): Observable<any> {
    const fechaInicio = params?.fechaInicio || '2024-06-01T00:00:00';
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const idTagParam = params?.idTag ? `&idTag=${params.idTag}` : '';
    const url = `${this.baseApiUrl}/publico/articulos?fechaInicio=${encodeURIComponent(fechaInicio)}&page=${page}&size=${size}${idTagParam}`;
    return this.http.get<any>(url, { headers: this.getOptionalHeaders() });
  }

  // Formatear fecha para display
  formatDisplayDate(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  private formatDate(dateStr: string, endOfDay = false): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr + (endOfDay ? 'T23:59:59' : 'T00:00:00');
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = endOfDay ? '23' : '00';
    const mi = endOfDay ? '59' : '00';
    const ss = endOfDay ? '59' : '00';
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  }
}

export { BlogArticle };
