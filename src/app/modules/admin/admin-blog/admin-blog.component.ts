import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BlogDeleteComponent } from '../blog-delete/blog-delete.component';
import { BlogService } from '../blog.service';
import { Tag, AdminBlog } from '../blog.types';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarAdminComponent, 
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './admin-blog.component.html',
  styleUrls: ['./admin-blog.component.css']
})
export class AdminBlogComponent implements OnInit {
  blogs: AdminBlog[] = [];
  filteredBlogs: AdminBlog[] = [];
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

  availableTags: Tag[] = [];

  pages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  Math = Math;
  baseApiUrl: any;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadTags();
    this.loadBlogs();
  }

  loadTags() {
    this.blogService.getAllTags().subscribe({
      next: (tags) => { this.availableTags = tags; },
      error: (err) => { console.error('Error al cargar tags:', err); }
    });
  }

  loadBlogs() {
    this.loading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado. Por favor, inicia sesión.');
      this.router.navigate(['/login']);
      return;
    }

    this.blogService.getBlogs({
      page: this.currentPage,
      size: this.pageSize,
      tag: this.selectedTag,
      estado: this.selectedEstado,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    }).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        if (Array.isArray(response)) {
          // Respuesta simple (sin paginación)
          this.blogs = response;
          this.filteredBlogs = [...response];
          this.totalElements = response.length;
          this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        } else {
          // Respuesta paginada
          this.blogs = response.content || [];
          this.filteredBlogs = [...this.blogs];
          this.totalElements = Number(response.totalElements) || 0;
          this.totalPages = Number(response.totalPages) || 0;
          this.currentPage = Number(response.number) || 0;
          this.pageSize = Number(response.size) || this.pageSize;
        }

        console.log('Datos de paginación:', {
          totalElements: this.totalElements,
          totalPages: this.totalPages,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          blogsLength: this.blogs.length
        });

        this.applyFilters();
        this.computePaginationInfo();
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
    let filtered = [...this.blogs];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(blog =>
        (blog.titulo?.toLowerCase() || '').includes(searchLower) ||
        (blog.descripcionCorta?.toLowerCase() || '').includes(searchLower) ||
        (blog.estado?.toLowerCase() || '').includes(searchLower) ||
        (blog.nombreUsuario?.toLowerCase() || '').includes(searchLower)
      );
    }

    this.filteredBlogs = filtered;
  }

  computePaginationInfo() {
    // Asegurar que sean números válidos
    this.totalElements = Number(this.totalElements) || 0;
    this.currentPage = Number(this.currentPage) || 0;
    this.pageSize = Number(this.pageSize) || 5;
    this.totalPages = Number(this.totalPages) || 0;

    // Si totalPages es 0 pero tenemos elementos, calcularlo
    if (this.totalPages === 0 && this.totalElements > 0) {
      this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    }

    // Construir array de páginas para *ngFor
    this.pages = Array.from({ length: Math.max(1, this.totalPages) }, (_, i) => i);

    // startIndex y endIndex para mostrar "Mostrando X a Y de Z"
    if (this.totalElements === 0) {
      this.startIndex = 0;
      this.endIndex = 0;
    } else {
      this.startIndex = this.currentPage * this.pageSize + 1;
      this.endIndex = Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    }

    console.log('Info de paginación calculada:', {
      pages: this.pages,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      totalPages: this.totalPages
    });
  }

  onFilterChange() {
    this.currentPage = 0;
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

  getEstadoClass(estado?: string): string {
    switch (estado) {
      case 'PUBLICADO':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'BORRADOR':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'ARCHIVADO':
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-50 text-gray-500 px-2 py-1 rounded-full text-xs font-medium';
    }
  }

  crearBlog() { 
    this.router.navigate(['/admin/blog/create']); 
  }

  editarBlog(blog: AdminBlog) {
    if (!blog.idArticulo) {
      alert('No se pudo editar este artículo.');
      return;
    }
    this.router.navigate(['/admin/blog/edit', blog.idArticulo]);
  }

  toggleArchive(blog: AdminBlog) {
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
        const userId = 1;
        this.blogService.toggleArchiveBlog(blog.idArticulo, accion as 'archivar' | 'desarchivar', userId)
          .subscribe({
            next: (res) => { 
              alert(res); 
              this.loadBlogs(); 
            },
            error: (err) => { 
              console.error(`Error al ${accion} blog:`, err); 
              alert(`Error al ${accion} blog.`); 
            }
          });
      }
    });
  }
}