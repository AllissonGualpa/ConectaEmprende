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
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { SolicitudService } from './solicitud.service';
import { AuthService } from '../../auth/auth.service';
import { ModalWrapperEditSolicitudComponent } from '../../../shared/components/modal-wrapper-edit-solicitud/modal-wrapper-edit-solicitud.component';

// Interface ajustada al backend real
export interface Solicitud {
  id: number;
  estado: string;
  observaciones: string;
  fechaSolicitud: string; // o Date si luego haces parse
  fechaRespuesta: string | null;
  emprendimientoId: number;
  usuarioId: number;
  usuarioAdministradorId: number | null;
}

@Component({
  selector: 'app-admin-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    NavbarAdminComponent,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    // no es necesario importar el componente hijo aquí, se abre dentro del modal wrapper
    ModalWrapperEditSolicitudComponent,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './admin-solicitudes.component.html',
  styleUrls: ['./admin-solicitudes.component.css'],
})
export class AdminSolicitudesComponent implements OnInit {
  solicitudes: Solicitud[] = [];
  filteredSolicitudes: Solicitud[] = [];
  loading = false;
  searchTerm = '';

  selectedEstado: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;

  pages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  Math = Math;

  // 0: Pendientes, 1: En espera, 2: Pendientes de Actualizar
  selectedTab = 0;

  constructor(
    private solicitudService: SolicitudService,
    private router: Router,
    private dialog: MatDialog,
    private authServices: AuthService
  ) {}

  ngOnInit() {
    this.loadSolicitudes();
  }

  loadSolicitudes() {
    this.loading = true;
    const token = localStorage.getItem('token');
    if (!token) {
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
      this.loading = false;
      return;
    }

    this.solicitudService
      .getSolicitudes({
        page: this.currentPage,
        size: this.pageSize,
        estado: this.selectedEstado,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
      })
      .subscribe({
        next: (response: any) => {
          if (
            response &&
            typeof response === 'object' &&
            'pageable' in response
          ) {
            const r = response as any;
            this.solicitudes = r.content || [];
            this.filteredSolicitudes = [...this.solicitudes];
            this.totalElements = Number(r.pageable.length) || 0;
            this.totalPages = Number(r.pageable.lastPage) + 1 || 1;
            this.currentPage = Number(r.pageable.page) || 0;
            this.pageSize = Number(r.pageable.size) || this.pageSize;
          } else if (Array.isArray(response)) {
            this.solicitudes = response;
            this.filteredSolicitudes = [...response];
            this.totalElements = response.length;
            this.totalPages = Math.ceil(this.totalElements / this.pageSize);
          }

          this.applyFilters();
          this.computePaginationInfo();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar solicitudes:', error);
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

  applyFilters() {
    let filtered = [...this.solicitudes];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          (s.estado ?? '').toLowerCase().includes(searchLower) ||
          (s.observaciones ?? '').toLowerCase().includes(searchLower) ||
          String(s.id ?? '')
            .toLowerCase()
            .includes(searchLower) ||
          String(s.emprendimientoId ?? '')
            .toLowerCase()
            .includes(searchLower)
      );
    }

    this.filteredSolicitudes = filtered;
  }

  computePaginationInfo() {
    this.totalElements = Number(this.totalElements) || 0;
    this.currentPage = Number(this.currentPage) || 0;
    this.pageSize = Number(this.pageSize) || 5;
    this.totalPages = Number(this.totalPages) || 0;

    if (this.totalPages === 0 && this.totalElements > 0) {
      this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    }

    this.pages = Array.from(
      { length: Math.max(1, this.totalPages) },
      (_, i) => i
    );

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

  onFilterChange() {
    this.currentPage = 0;
    this.loadSolicitudes();
  }

  // Cambiar firma y cuerpo
  onSearch(event: any) {
    this.searchTerm = (event?.target?.value || '').toLowerCase();
    this.applyFilters();
  }

  // Tabs
  setTab(index: number) {
    this.selectedTab = index;
    // aquí más adelante puedes cambiar endpoint según el tab seleccionado
    // por ahora solo recargamos
    this.currentPage = 0;
    this.loadSolicitudes();
  }

  get selectedTabLabel(): string {
    switch (this.selectedTab) {
      case 0:
        return 'Pendientes';
      case 1:
        return 'En espera';
      case 2:
        return 'Pendientes de Actualizar';
      default:
        return '';
    }
  }

  clearFilters() {
    this.selectedEstado = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadSolicitudes();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadSolicitudes();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadSolicitudes();
    }
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadSolicitudes();
  }

  getEstadoClass(estado?: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'APROBADA':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'RECHAZADA':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-50 text-gray-500 px-2 py-1 rounded-full text-xs font-medium';
    }
  }

  verDetalle(solicitud: Solicitud) {
    if (!solicitud || (!solicitud.id && !solicitud.emprendimientoId)) {
      this.dialog.open(MensajeConfirmacionComponent, {
        width: '420px',
        data: {
          subject: 'Solicitud',
          title: 'No se pudo abrir esta solicitud',
          subtitle: 'La solicitud no tiene un identificador válido.',
          type: 'error',
        },
      });
      return;
    }

    const idParaVer = solicitud.emprendimientoId ?? solicitud.id ?? null;
    if (!idParaVer) {
      // fallback por seguridad
      return;
    }

    // Abrir el wrapper modal (contiene botón cerrar en la cabecera y el componente hijo)
    const dialogRef = this.dialog.open(ModalWrapperEditSolicitudComponent, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { emprendimientoId: idParaVer, soloLectura: true }
    });

    // Opcional: reaccionar cuando se cierre el modal (por ejemplo, recargar lista)
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated' || result === 'saved') {
        this.loadSolicitudes();
      }
    });
  }

  cambiarEstado(solicitud: Solicitud, nuevoEstado: 'APROBADA' | 'RECHAZADA') {
    if (!solicitud.id) return;

    const dialogRef = this.dialog.open(MensajeConfirmacionComponent, {
      width: '420px',
      data: {
        subject: 'Solicitud',
        title: `¿Confirmas marcar como ${nuevoEstado.toLowerCase()} la solicitud #${
          solicitud.id
        }?`,
        subtitle:
          nuevoEstado === 'APROBADA'
            ? 'Esta acción aprobará la solicitud.'
            : 'Esta acción rechazará la solicitud.',
        type: 'info',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        const userId = 1; // TODO: reemplaza por el id real del usuario logueado
        this.solicitudService
          .cambiarEstadoSolicitud(solicitud.id, nuevoEstado, userId)
          .subscribe({
            next: () => {
              this.dialog.open(MensajeConfirmacionComponent, {
                width: '420px',
                data: {
                  subject: 'Solicitud',
                  title: `Solicitud ${nuevoEstado.toLowerCase()} exitosamente`,
                  type: 'success',
                },
              });
              this.loadSolicitudes();
            },
            error: (err) => {
              console.error(`Error al cambiar estado de solicitud:`, err);
              this.dialog.open(MensajeConfirmacionComponent, {
                width: '420px',
                data: {
                  subject: 'Solicitud',
                  title: `Error al cambiar el estado de la solicitud`,
                  subtitle:
                    'No se pudo completar la operación. Por favor, inténtalo nuevamente.',
                  type: 'error',
                },
              });
              this.loading = false;
            },
          });
      }
    });
  }
}
