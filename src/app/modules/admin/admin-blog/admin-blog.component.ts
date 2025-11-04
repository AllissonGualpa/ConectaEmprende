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
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  availableTags: any[] = [];

  pages: number[] = []; 
  startIndex = 0; 
  endIndex = 0; 

  // Exponer Math para el template
  Math = Math;

  private baseApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/admin/articulos';
  private tagsApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/tags';

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

    const formatNoTZ = (dateStr: string, endOfDay = false) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr + (endOfDay ? 'T23:59:59' : 'T00:00:00');
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = endOfDay ? '23' : '00';
      const mi = endOfDay ? '59' : '00';
      const ss = endOfDay ? '59' : '00';
      return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
    };

    params.push(`fechaInicio=${encodeURIComponent(formatNoTZ(inicio, false))}`);
    params.push(`fechaFin=${encodeURIComponent(formatNoTZ(fin, true))}`);

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
        if (response.content) {
          this.blogs = response.content;

          // Normalizar totalElements aceptando diferentes nombres que pueda devolver la API
          const totalElems = response.totalElements ?? response.total ?? response.totalItems ?? response.total_count ?? (Array.isArray(this.blogs) ? this.blogs.length : 0);
          this.totalElements = Number(totalElems) || 0;

          // Normalizar totalPages (si no viene, calcularlo)
          const totalPgs = response.totalPages ?? (this.totalElements ? Math.ceil(this.totalElements / (response.size ?? this.pageSize)) : 0);
          this.totalPages = Number(totalPgs) || 0;

          // sincronizar pagina y tamaño con lo que devuelve la API (si están)
          if (typeof response.number === 'number') {
            this.currentPage = response.number;
          }
          if (typeof response.size === 'number') {
            this.pageSize = response.size;
          }
        } else {
          // Si la respuesta es un array directo
          this.blogs = Array.isArray(response) ? response : [];
          this.totalElements = this.blogs.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        }
        this.applyFilters();
        this.computePaginationInfo(); // actualizar datos de paginación
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
    // recalcular índices en caso de filtrado cliente
    this.computePaginationInfo();
  }

  computePaginationInfo() {
    // Asegurar que sean números válidos
    this.totalElements = Number(this.totalElements) || 0;
    this.currentPage = Number(this.currentPage) || 0;
    this.pageSize = Number(this.pageSize) || 1;

    // Construir array de páginas para *ngFor
    this.pages = Array.from({ length: Math.max(0, this.totalPages) }, (_, i) => i);

    // startIndex y endIndex para mostrar "Mostrando X a Y de Z"
    if (this.totalElements === 0) {
      this.startIndex = 0;
      this.endIndex = 0;
    } else {
      this.startIndex = this.currentPage * this.pageSize + 1;
      this.endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    }
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
    if (page < 0 || page >= this.totalPages) return;
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