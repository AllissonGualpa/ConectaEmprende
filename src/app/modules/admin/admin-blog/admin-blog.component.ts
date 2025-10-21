import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [CommonModule, NavbarAdminComponent, FormsModule],
  templateUrl: './admin-blog.component.html',
  styleUrls: ['./admin-blog.component.css']
})
export class AdminBlogComponent implements OnInit {
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  loading = false;
  searchTerm = '';

  // Filtros
  selectedTag: string = '';
  selectedEstado: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  availableTags: any[] = []; // se cargan desde la API

  private baseApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/articulos';
  private tagsApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/tags';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadTags(); // Cargar tags
    this.loadBlogs(); // Cargar blogs
  }

  /** Carga los tags desde la API */
  loadTags() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(this.tagsApiUrl, { headers }).subscribe({
      next: (tags) => {
        this.availableTags = tags;
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
      }
    });
  }

  /** Construye la URL de la API con los filtros */
  buildApiUrl(): string {
    let url = this.baseApiUrl;
    const params: string[] = [];

    if (this.fechaInicio) {
      params.push(`fechaInicio=${encodeURIComponent(new Date(this.fechaInicio + 'T00:00:00').toISOString())}`);
    }
    if (this.fechaFin) {
      params.push(`fechaFin=${encodeURIComponent(new Date(this.fechaFin + 'T23:59:59').toISOString())}`);
    }

    if (this.selectedTag) {
      params.push(`tag=${this.selectedTag}`);
    }

    if (this.selectedEstado) {
      params.push(`estado=${this.selectedEstado}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    console.log('URL de la API:', url);
    return url;
  }

  /** Carga los artículos desde la API */
  loadBlogs() {
    this.loading = true;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró token en el almacenamiento local.');
      alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const apiUrl = this.buildApiUrl();

    this.http.get<any[]>(apiUrl, { headers }).subscribe({
      next: (response) => {
        console.log('Blogs cargados:', response);
        this.blogs = response;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar blogs:', error);
        this.loading = false;

        if (error.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /** Aplica filtros */
  applyFilters() {
    let filtered = this.blogs;

    // Filtro de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(blog =>
        blog.titulo?.toLowerCase().includes(this.searchTerm) ||
        blog.descripcionCorta?.toLowerCase().includes(this.searchTerm) ||
        blog.estado?.toLowerCase().includes(this.searchTerm)
      );
    }

    // Filtro por tag
    if (this.selectedTag) {
      filtered = filtered.filter(blog =>
        blog.tags?.some((tag: any) => tag.idTag == this.selectedTag)
      );
    }

    // Filtro por estado
    if (this.selectedEstado) {
      filtered = filtered.filter(blog => blog.estado === this.selectedEstado);
    }

    this.filteredBlogs = filtered;
  }

  /** Maneja cambios en filtros */
  onFilterChange() {
    this.loadBlogs(); // Recarga desde API y aplica filtros
  }

  /** Maneja búsqueda */
  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  /** Limpia todos los filtros */
  clearFilters() {
    this.selectedTag = '';
    this.selectedEstado = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.searchTerm = '';
    this.loadBlogs();
  }

  /** Clase CSS para estado */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PUBLICADO':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs';
      case 'BORRADOR':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs';
      case 'ARCHIVADO':
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
    }
  }

  crearBlog() {
    this.router.navigate(['/admin/blog/create']);
  }

  editarBlog(blog: any) {
    console.log('Editar blog:', blog);
  }

  eliminarBlog(blog: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar el blog "${blog.titulo}"?`)) {
      console.log('Eliminar blog:', blog);
    }
  }
}
