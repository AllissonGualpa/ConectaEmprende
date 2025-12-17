import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { BlogService } from '../blog.service';
import { Tag, AdminBlog } from '../blog.types';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { AuthService } from '../../auth/auth.service';
import { finalize } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    MatIconModule,
  ],
  templateUrl: './admin-blog.component.html',
  styleUrls: ['./admin-blog.component.css'],
})
export class AdminBlogComponent implements OnInit, OnDestroy {
  blogs: AdminBlog[] = [];
  filteredBlogs: AdminBlog[] = [];
  loading = false;
  searchTerm = '';
  // Subject para búsquedas con debounce -> envía al API
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSub?: Subscription;

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
    private dialog: MatDialog,
    private authServices: AuthService
  ) {}

  ngOnInit() {
    // 1) Primero cargamos tags sin tocar loading global
    this.loadTagsAndBlogs();

    // 2) Suscribir término de búsqueda con debounce para llamar al API
    this.searchSub = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value: string) => {
        this.searchTerm = value;
        this.currentPage = 0; // reset paginación al buscar
        this.loadBlogs(); // solicitar al API usando titulo = searchTerm
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  private loadTagsAndBlogs(): void {
    this.loading = true; // empezamos estado de carga general

    this.blogService.getAllTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
        // 2) cuando terminen los tags, recién pedimos blogs
        this.loadBlogs();
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        // aunque fallen los tags, intentamos cargar blogs para no bloquear la pantalla
        this.loadBlogs();
      },
    });
  }

  loadTags() {
    // Si quieres reutilizarlo en otro lado, que NO toque 'loading'
    this.blogService.getAllTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
      },
    });
  }

  loadBlogs(): void {
    this.loading = true;

    this.blogService
      .getBlogs({
        page: this.currentPage,
        size: this.pageSize,
        tag: this.selectedTag,
        titulo: this.searchTerm,
        estado: this.selectedEstado,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Detecta si la respuesta tiene paginación
          if (
            response &&
            typeof response === 'object' &&
            'pageable' in response
          ) {
            const r = response as any;
            this.blogs = r.content || [];
            this.filteredBlogs = [...this.blogs];
            this.totalElements = Number(r.pageable.length) || 0;
            this.totalPages = Number(r.pageable.lastPage) + 1 || 1;
            this.currentPage = Number(r.pageable.page) || 0;
            this.pageSize = Number(r.pageable.size) || this.pageSize;
          }
          // Si el backend devuelve un array plano
          else if (Array.isArray(response)) {
            this.blogs = response;
            this.filteredBlogs = [...response];
            this.totalElements = response.length;
            this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          }

          this.applyFilters();
          this.computePaginationInfo();
        },
        error: (error) => {
          console.error('Error al cargar blogs:', error);
          this.blogs = [];
          this.filteredBlogs = [];
          if (error.status === 401) {
            this.dialog.open(MensajeConfirmacionComponent, {
              width: '420px',
              data: {
                subject: 'Sesión expirada',
                title: 'Tu sesión ha expirado',
                subtitle: 'Por favor, inicia sesión nuevamente.',
                type: 'error',
              },
            });
            this.authServices.logout();
            this.router.navigate(['/login']);
          }
        },
      });
  }

  applyFilters() {
    let filtered = [...this.blogs];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (blog) =>
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
    this.pages = Array.from(
      { length: Math.max(1, this.totalPages) },
      (_, i) => i
    );

    // startIndex y endIndex para mostrar "Mostrando X a Y de Z"
    if (this.totalElements === 0) {
      this.startIndex = 0;
      this.endIndex = 0;
    } else {
      this.startIndex = this.currentPage * this.pageSize + 1;
      this.endIndex = Math.min(
        (this.currentPage + 1) * this.pageSize,
        this.totalElements
      );
    }
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadBlogs();
  }

  onSearch(value: string) {
    // Emitir al Subject (debounce + llamada al API en la suscripción)
    this.searchSubject.next(value);
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
      this.dialog.open(MensajeConfirmacionComponent, {
        width: '420px',
        data: {
          subject: 'Edición de blog',
          title: 'No se pudo editar este artículo',
          subtitle: 'El artículo no tiene un identificador válido.',
          type: 'error',
        },
      });
      return;
    }
    this.router.navigate(['/admin/blog/edit', blog.idArticulo]);
  }

  toggleArchive(blog: AdminBlog) {
    if (!blog.idArticulo) return;
    const accion = blog.estado === 'ARCHIVADO' ? 'desarchivar' : 'archivar';

    const dialogRef = this.dialog.open(MensajeConfirmacionComponent, {
      width: '420px',
      data: {
        subject: 'Blog',
        title: `¿Estás seguro que deseas ${accion} el blog "${blog.titulo}"?`,
        subtitle:
          blog.estado === 'ARCHIVADO'
            ? 'Esta acción desarchivará el artículo y volverá a estar visible.'
            : 'Esta acción archivará el artículo. Podrás restaurarlo más tarde si lo deseas.',
        type: 'info',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true; // Activar loading antes de la operación
        const userId = 1;
        this.blogService
          .toggleArchiveBlog(
            blog.idArticulo,
            accion as 'archivar' | 'desarchivar',
            userId
          )
          .pipe(
            finalize(() => {
              this.loading = false; // Desactivar loading después de la operación
            })
          )
          .subscribe({
            next: () => {
              this.dialog.open(MensajeConfirmacionComponent, {
                width: '420px',
                data: {
                  subject: 'Blog',
                  title: `Blog ${
                    accion === 'archivar' ? 'archivado' : 'desarchivado'
                  } exitosamente`,
                  type: 'success',
                },
              });
              this.loadBlogs(); // Recargar blogs después de la operación
            },
            error: (err) => {
              console.error(`Error al ${accion} blog:`, err);
              this.dialog.open(MensajeConfirmacionComponent, {
                width: '420px',
                data: {
                  subject: 'Blog',
                  title: `Error al ${accion} el blog`,
                  subtitle:
                    'No se pudo completar la operación. Por favor, inténtalo nuevamente.',
                  type: 'error',
                },
              });
            },
          });
      }
    });
  }
}
