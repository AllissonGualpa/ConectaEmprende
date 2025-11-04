import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MatDialog } from '@angular/material/dialog';
import { BlogDeleteComponent } from '../blog-delete/blog-delete.component';

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

  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  availableTags: any[] = [];

  // Exponer Math para el template
  Math = Math;

  private baseApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/admin/articulos';
  private tagsApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/publico/tags';

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadTags();
    this.loadBlogs();
  }

  loadTags() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(this.tagsApiUrl, { headers }).subscribe({
      next: (tags) => { this.availableTags = tags; },
      error: (err) => { console.error('Error al cargar tags:', err); }
    });
  }

  buildApiUrl(): string {
    let url = this.baseApiUrl;
    const params: string[] = [];

    // Fechas por defecto si no están definidas
    const inicio = this.fechaInicio || '2024-01-01';
    const fin = this.fechaFin || '2025-12-31';

    params.push(`fechaInicio=${encodeURIComponent(new Date(inicio + 'T00:00:00').toISOString())}`);
    params.push(`fechaFin=${encodeURIComponent(new Date(fin + 'T23:59:59').toISOString())}`);

    // Paginación
    params.push(`page=${this.currentPage}`);
    params.push(`size=${this.pageSize}`);

    if (this.selectedTag) {
      params.push(`tag=${this.selectedTag}`);
    }
    if (this.selectedEstado) {
      params.push(`estado=${this.selectedEstado}`);
    }

    url += '?' + params.join('&');
    console.log('URL de la API:', url);
    return url;
  }

  loadBlogs() {
    this.loading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const apiUrl = this.buildApiUrl();

    this.http.get<any>(apiUrl, { headers }).subscribe({
      next: (response) => {
        // La respuesta es paginada
        if (response.content) {
          this.blogs = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
        } else {
          // Si la respuesta es un array directo
          this.blogs = Array.isArray(response) ? response : [];
        }
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

  applyFilters() {
    let filtered = this.blogs;

    if (this.searchTerm) {
      filtered = filtered.filter(blog =>
        blog.titulo?.toLowerCase().includes(this.searchTerm) ||
        blog.descripcionCorta?.toLowerCase().includes(this.searchTerm) ||
        blog.estado?.toLowerCase().includes(this.searchTerm) ||
        blog.nombreUsuario?.toLowerCase().includes(this.searchTerm)
      );
    }

    this.filteredBlogs = filtered;
  }

  onFilterChange() {
    this.currentPage = 0; // Resetear a la primera página
    this.loadBlogs();
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  clearFilters() {
    this.selectedTag = '';
    this.selectedEstado = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadBlogs();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadBlogs();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadBlogs();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadBlogs();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PUBLICADO': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs';
      case 'BORRADOR': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs';
      case 'ARCHIVADO': return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
    }
  }

  crearBlog() { this.router.navigate(['/admin/blog/create']); }

  editarBlog(blog: any) {
    if (!blog.idArticulo) {
      alert('No se pudo editar este artículo.');
      return;
    }
    this.router.navigate(['/admin/blog/edit', blog.idArticulo]);
  }

  toggleArchive(blog: any) {
    if (!blog.idArticulo) return;
    const accion = blog.estado === 'ARCHIVADO' ? 'desarchivar' : 'archivar';

    const dialogRef = this.dialog.open(BlogDeleteComponent, {
      width: '450px',
      data: {
        title: `¿Estás seguro que deseas ${accion} el blog "${blog.titulo}"?`,
        message: blog.estado === 'ARCHIVADO'
          ? 'Esta acción desarchivará el artículo y volverá a estar visible.'
          : 'Esta acción archivará el artículo. Podrás restaurarlo más tarde si lo deseas.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No estás autenticado.');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        const userId = 1;
        const apiUrl = `https://eureka-emprende.onrender.com/v1/blog/articulos/${blog.idArticulo}/${accion}?idUsuario=${userId}`;

        this.http.put(apiUrl, {}, { headers, responseType: 'text' }).subscribe({
          next: (res) => { alert(res); this.loadBlogs(); },
          error: (err) => { console.error(`Error al ${accion} blog:`, err); alert(`Error al ${accion} blog.`); }
        });
      }
    });
  }
}