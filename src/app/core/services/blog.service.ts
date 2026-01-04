import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Tag,
  BlogCreate,
  BlogArticle,
  AdminBlog,
  PaginatedResponse
} from '../types/blog.types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseApiUrl = environment.api_url + environment.api_blog;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Obtener todos los tags

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseApiUrl}/tags`);
  }

  createTag(nombre: string): Observable<Tag> {
    return this.http.post<Tag>(
      `${this.baseApiUrl}/tags`,
      { nombre },
      { headers: this.getHeaders() }
    );
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
  }): Observable<PaginatedResponse<AdminBlog>> {

    let url = `${this.baseApiUrl}/admin/articulos?page=${params.page}&size=${params.size}`;

    if (params.fechaInicio) url += `&fechaInicio=${params.fechaInicio}`;
    if (params.fechaFin) url += `&fechaFin=${params.fechaFin}`;
    if (params.tag) url += `&idTag=${params.tag}`;
    if (params.titulo) url += `&titulo=${params.titulo}`;
    if (params.estado) url += `&estado=${params.estado}`;

    return this.http.get<PaginatedResponse<AdminBlog>>(url, {
      headers: this.getHeaders()
    });
  }

  getArticleById(id: number): Observable<BlogArticle> {
    return this.http.get<BlogArticle>(
      `${this.baseApiUrl}/admin/articulos/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Métodos para crear, actualizar, archivar artículos

  /**
   * Crear un nuevo artículo de blog
   * @param formData FormData con titulo, descripcionCorta, contenido, estado, imagen, idsTags
   * @param idUsuario ID del usuario que crea el artículo
   */
  createBlog(formData: FormData, idUsuario: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post(
      `${this.baseApiUrl}/articulos/crear?idUsuario=${idUsuario}`,
      formData,
      { headers }
    );
  }

  /**
   * Actualizar un artículo existente
   * @param id ID del artículo a actualizar
   * @param formData FormData con los campos a actualizar
   * @param idUsuario ID del usuario que actualiza
   */
  updateArticle(
    id: number,
    formData: FormData,
    idUsuario: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.put(
      `${this.baseApiUrl}/articulos/${id}?idUsuario=${idUsuario}`,
      formData,
      { headers }
    );
  }

  /**
   * Archivar o desarchivar un artículo
   * @param id ID del artículo
   * @param accion 'archivar' o 'desarchivar'
   * @param idUsuario ID del usuario que realiza la acción
   */
  toggleArchiveBlog(
    id: number,
    accion: 'archivar' | 'desarchivar',
    idUsuario: number
  ): Observable<any> {
    const url = `${this.baseApiUrl}/articulos/${id}/${accion}?idUsuario=${idUsuario}`;
    
    return this.http.patch(
      url,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Obtener artículos públicos (paginados) — usado por la landing

  getPublicArticles(params: {
    page: number;
    size: number;
    idTag?: string;
    query?: string;
  }): Observable<PaginatedResponse<BlogArticle>> {

    let url = `${this.baseApiUrl}/publico/articulos?page=${params.page}&size=${params.size}`;
    if (params.idTag) url += `&idTag=${params.idTag}`;
    if (params.query) url += `&titulo=${params.query}`;

    return this.http.get<PaginatedResponse<BlogArticle>>(url);
  }

   //Obtener un artículo público por ID
  getPublicArticleById(id: number): Observable<BlogArticle> {
    return this.http.get<BlogArticle>(
      `${this.baseApiUrl}/publico/articulos/${id}`
    );
  }
  
  formatDisplayDate(date: string): string {
    return new Date(date).toLocaleDateString('es-EC');
  }
}