export interface Tag {
  idTag: number;
  nombre: string;
}

export interface BlogCreate {
  titulo: string;
  resumen: string;
  contenido: string;
  tags: Tag[];
  imagenDestacada: File | null;
  estado: string;
}

export interface BlogArticle {
  resumen: string;
  idArticulo: number;
  titulo: string;
  descripcionCorta: string;
  contenido: string;
  urlImagen: string;
  fechaCreacion: string;
  fechaPublicacion?: string;
  tags: Tag[];
  estado: string;
}

export interface AdminBlog {
  idArticulo: number;
  titulo: string;
  descripcionCorta?: string;
  contenido?: string;
  urlImagen?: string;
  fechaCreacion?: string;
  nombreUsuario?: string;
  tags?: Tag[];
  estado?: string;
}

export interface PageableInfo {
  page: number;
  size: number;
  length: number;
  lastPage: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: PageableInfo;
}
