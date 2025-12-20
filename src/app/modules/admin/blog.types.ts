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
	id: number;
	titulo: string;
	descripcionCorta: string;
	contenido: string;
	urlImagen: string;
	fechaCreacion: string;
	fechaPublicacion?: string;
	tags: Tag[];
	estado: string;
}

// Representa la fila que usa el admin list (observa idArticulo en el front)
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

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  pageable: AdminBlog[];
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
}