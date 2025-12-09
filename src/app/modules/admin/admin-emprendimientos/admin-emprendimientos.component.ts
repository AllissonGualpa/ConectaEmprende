import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { Environment } from '../../../../environments/environment';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';

// Imports de Angular Material para que se vea como admin-blog
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-emprendimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarAdminComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './admin-emprendimientos.component.html',
})
export class AdminEmprendimientosComponent implements OnInit {
  emprendimientos: any[] = [];
  tiposEmprendimiento: any[] = [];
  filteredEmprendimientos: any[] = [];
  categorias: any[] = [];

  ciudades: any[] = [];
  selectedCiudad = '';

  searchTerm = '';
  selectedCategory = '';
  selectedDate: any = '';

  loading = false;

  // Estado de paginación
  pageSize: number = 10;
  currentPage: number = 0;
  totalElements: number = 0;
  totalPages: number = 0;
  pages: number[] = [];
  startIndex: number = 0;
  endIndex: number = 0;

  private apiEmprendimientos =
    Environment.api_url + Environment.api_emprendimientos;
  private apiTipos = Environment.api_url + Environment.api_tipos;
  private apiCategorias = Environment.api_url + Environment.api_categorias;
  private apiCiudades = Environment.api_url + Environment.api_ciudades;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private authServices: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      this.loading = false;
      this.dialog.open(MensajeConfirmacionComponent, {
        width: '420px',
        data: {
          subject: 'Autenticación',
          title: 'No estás autenticado',
          subtitle: 'Por favor, inicia sesión para continuar.',
          type: 'error',
        },
      });
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Carga inicial de combos + emprendimientos paginados
    forkJoin({
      tipos: this.http.get<any[]>(this.apiTipos, { headers }),
      categorias: this.http.get<any[]>(this.apiCategorias, { headers }),
      ciudades: this.http.get<any[]>(this.apiCiudades, { headers }),
      emprendimientos: this.http.get<any>(this.apiEmprendimientos, {
        headers,
        params: new HttpParams()
          .set('page', String(this.currentPage))
          .set('size', String(this.pageSize)),
      }),
    }).subscribe({
      next: ({ tipos, categorias, ciudades, emprendimientos }) => {
        this.tiposEmprendimiento = tipos;
        this.categorias = categorias;
        this.ciudades = ciudades;

        const lista = emprendimientos?.content ?? [];
        const pageable = emprendimientos?.pageable;

        if (pageable) {
          this.totalElements =
            typeof pageable.totalElements === 'number' &&
            pageable.totalElements >= 0
              ? pageable.totalElements
              : lista.length;
          this.pageSize =
            typeof pageable.pageSize === 'number' && pageable.pageSize > 0
              ? pageable.pageSize
              : this.pageSize;
          this.currentPage =
            typeof pageable.pageNumber === 'number' && pageable.pageNumber >= 0
              ? pageable.pageNumber
              : 0;
          this.totalPages =
            typeof pageable.totalPages === 'number' && pageable.totalPages > 0
              ? pageable.totalPages
              : Math.max(
                  1,
                  Math.ceil(this.totalElements / this.pageSize)
                );
        } else {
          this.totalElements = lista.length;
          this.totalPages =
            this.pageSize > 0
              ? Math.max(1, Math.ceil(this.totalElements / this.pageSize))
              : 1;
        }

        if (this.totalPages === 0 && this.totalElements > 0) {
          this.totalPages = 1;
        }

        this.emprendimientos = this.mapEmprendimientos(lista);
        this.filteredEmprendimientos = [...this.emprendimientos];
        this.computePaginationInfo();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar emprendimientos:', error);
        this.loading = false;
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

  private mapEmprendimientos(lista: any[]): any[] {
    return lista.map(
      (emp: { tipoEmprendimientoId: any; nombreTipoEmprendimiento: any }) => {
        const tipoData = this.tiposEmprendimiento.find(
          (t) => t.id === emp.tipoEmprendimientoId
        );
        return {
          ...emp,
          tipoInfo: {
            tipo: tipoData ? tipoData.tipo : 'Desconocido',
            subTipo: tipoData
              ? tipoData.subTipo.trim()
              : emp.nombreTipoEmprendimiento,
          },
        };
      }
    );
  }

  // Llamar al backend aplicando filtros como query params (con paginación)
  applyFilters() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    this.loading = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    let params = new HttpParams();

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      params = params.set('nombre', this.searchTerm.trim());
    }

    if (this.selectedCategory && this.selectedCategory !== '') {
      params = params.set('categoria', this.selectedCategory);
    }

    if (this.selectedCiudad && this.selectedCiudad !== '') {
      params = params.set('ciudad', this.selectedCiudad);
    }

    // paginación desde el estado
    params = params
      .set('page', String(this.currentPage))
      .set('size', String(this.pageSize));

    this.http
      .get<any>(this.apiEmprendimientos, { headers, params })
      .subscribe({
        next: (resp) => {
          const lista = resp?.content ?? resp ?? [];
          const pageable = resp?.pageable;

          if (pageable) {
            this.totalElements =
              typeof pageable.totalElements === 'number' &&
              pageable.totalElements >= 0
                ? pageable.totalElements
                : (Array.isArray(lista) ? lista.length : 0);
            this.pageSize =
              typeof pageable.pageSize === 'number' && pageable.pageSize > 0
                ? pageable.pageSize
                : this.pageSize;
            this.currentPage =
              typeof pageable.pageNumber === 'number' &&
              pageable.pageNumber >= 0
                ? pageable.pageNumber
                : 0;
            this.totalPages =
              typeof pageable.totalPages === 'number' &&
              pageable.totalPages > 0
                ? pageable.totalPages
                : Math.max(
                    1,
                    Math.ceil(this.totalElements / this.pageSize)
                  );
          } else {
            const len = Array.isArray(lista) ? lista.length : 0;
            this.totalElements = len;
            this.totalPages =
              this.pageSize > 0
                ? Math.max(1, Math.ceil(len / this.pageSize))
                : 1;
          }

          if (this.totalPages === 0 && this.totalElements > 0) {
            this.totalPages = 1;
          }

          this.emprendimientos = this.mapEmprendimientos(
            Array.isArray(lista) ? lista : []
          );
          this.filteredEmprendimientos = [...this.emprendimientos];
          this.computePaginationInfo();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al aplicar filtros:', error);
          this.loading = false;
        },
      });
  }

  reload() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedCiudad = '';
    this.selectedDate = '';
    this.currentPage = 0;
    this.loadData();
  }

  private computePaginationInfo(): void {
    this.currentPage = Number(this.currentPage) || 0;

    if (this.totalElements <= 0 || this.pageSize <= 0) {
      this.totalPages = 0;
      this.pages = [];
      this.startIndex = 0;
      this.endIndex = 0;
      return;
    }

    if (!this.totalPages || this.totalPages <= 0) {
      this.totalPages = Math.max(
        1,
        Math.ceil(this.totalElements / this.pageSize)
      );
    }

    if (this.currentPage >= this.totalPages) {
      this.currentPage = this.totalPages - 1;
    }
    if (this.currentPage < 0) this.currentPage = 0;

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);

    const baseIndex = this.currentPage * this.pageSize;
    this.startIndex = baseIndex + 1;
    this.endIndex = Math.min(baseIndex + this.pageSize, this.totalElements);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatHora(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getHoraColor(index: number): string {
    const colors = [
      'bg-green-50 text-green-700',
      'bg-blue-50 text-blue-700',
      'bg-yellow-50 text-yellow-700',
      'bg-pink-50 text-pink-700',
      'bg-purple-50 text-purple-700',
    ];
    return colors[index % colors.length];
  }

  editarEmprendimiento(emp: any) {
    this.router.navigate(['/admin/emprendimientos/edit', emp.id]);
  }

  desactivarEmprendimiento(emp: any) {
    const confirmado = confirm(
      `¿Seguro que deseas inactivar el emprendimiento "${emp.nombreComercial}"?`
    );

    if (!confirmado) {
      return;
    }
  }
}
