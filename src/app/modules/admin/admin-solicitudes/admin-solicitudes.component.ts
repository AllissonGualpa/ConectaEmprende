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
import { ModalObservacionesSolicitudComponent } from '../../shared/components/modal-observaciones-solicitud/modal-observaciones-solicitud.component';

// Interface ajustada al backend real
export interface Solicitud {
  id: number;
  emprendimientoId: number;
  nombreEmprendimiento: string;
  tipoSolicitud: string;
  estadoSolicitud: string;
  datosPropuestos: DatosPropuestos;
  datosOriginales: DatosPropuestos | null;
  observaciones: string | null;
  motivoRechazo: string | null;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
  nombreSolicitante: string;
  nombreRevisor: string | null;
}

interface DatosPropuestos {
  usuario: any | null;
  ciudadId: number;
  metricas: Metrica[];
  categorias: CategoriaEmprendimiento[];
  anioCreacion: string;
  descripciones: Descripcion[];
  nombreComercial: string;
  aceptaDatosPublicos: boolean;
  presenciasDigitales: PresenciaDigital[];
  activoEmprendimiento: boolean;
  declaracionesFinales: DeclaracionFinal[];
  tipoEmprendimientoId: number;
  informacionRepresentante: any | null;
  participacionesComunidad: ParticipacionComunidad[];
}

interface Metrica {
  valor: string;
  metricaId: number;
  emprendimientoId: number;
}

interface CategoriaEmprendimiento {
  categoria: Categoria;
  emprendimiento: Emprendimiento;
  nombreCategoria: string;
}

interface Categoria {
  id: number;
  nombre: string;
  urlImagen: string;
  descripcion: string;
  idMultimedia: number;
}

interface Emprendimiento {
  id: number;
  ciudad: number;
  provinia: number;
  correoUees: string | null;
  datosPublicos: boolean;
  fechaCreacion: string;
  identificacion: string | null;
  correoComercial: string | null;
  parienteDirecto: string | null;
  tipoEmprendimiento?: string;
  estadoEmpredimiento: string | null;
  tipoEmprendimientoId: number;
  nombreComercialEmprendimiento: string;
}

interface Descripcion {
  descripcion: string;
  obligatorio: boolean;
  maxCaracteres: number;
  tipoDescripcion: string;
  emprendimientoId: number;
  idEmprendimiento: number | null;
}

interface PresenciaDigital {
  plataforma: string;
  descripcion: string;
  emprendimientoId: number;
}

interface DeclaracionFinal {
  aceptada: boolean;
  nombreFirma: string;
  declaracionId: number;
  fechaAceptacion: string;
  emprendimientoId: number;
}

interface ParticipacionComunidad {
  respuesta: boolean;
  emprendimientoId: number;
  opcionParticipacionId: number;
  nombreOpcionParticipacion: string | null;
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
          (s.estadoSolicitud ?? '').toLowerCase().includes(searchLower) ||
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

  onSearch(event: any) {
    this.searchTerm = (event?.target?.value || '').toLowerCase();
    this.applyFilters();
  }

  // Tabs
  setTab(index: number) {
    this.selectedTab = index;
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
      return;
    }

    const dialogRef = this.dialog.open(ModalWrapperEditSolicitudComponent, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { emprendimientoId: idParaVer, soloLectura: true }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated' || result === 'saved') {
        this.loadSolicitudes();
      }
    });
  }

  /**
   * Aprobar solicitud
   */
  aprobarSolicitud(solicitud: Solicitud) {
    if (!solicitud.id) return;

    const dialogRef = this.dialog.open(MensajeConfirmacionComponent, {
      width: '420px',
      data: {
        subject: 'Aprobar Solicitud',
        title: `¿Confirmas aprobar la solicitud #${solicitud.id}?`,
        subtitle: 'Esta acción aprobará la solicitud del emprendimiento.',
        type: 'info',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.loading = true;
        this.solicitudService.aprobarSolicitud(solicitud.id).subscribe({
          next: (response) => {
            this.dialog.open(MensajeConfirmacionComponent, {
              width: '420px',
              data: {
                subject: 'Solicitud Aprobada',
                title: 'Solicitud aprobada exitosamente',
                subtitle: response.mensaje || 'La solicitud ha sido aprobada.',
                type: 'success',
              },
            });
            this.loadSolicitudes();
          },
          error: (err) => {
            console.error('Error al aprobar solicitud:', err);
            this.dialog.open(MensajeConfirmacionComponent, {
              width: '420px',
              data: {
                subject: 'Error',
                title: 'Error al aprobar la solicitud',
                subtitle: err.error?.error || 'No se pudo completar la operación.',
                type: 'error',
              },
            });
            this.loading = false;
          },
        });
      }
    });
  }

rechazarSolicitud(solicitud: Solicitud) {
  if (!solicitud.id) return;

  // Abrir modal para capturar motivo
  const dialogRef = this.dialog.open(ModalObservacionesSolicitudComponent, {
    width: '600px',
    disableClose: true,
    data: {
      tipo: 'rechazar',
      solicitudId: solicitud.id,
      nombreEmprendimiento: solicitud.emprendimientoId // o el nombre real si lo tienes
    }
  });

  dialogRef.afterClosed().subscribe((resultado) => {
    if (resultado) {
      this.loading = true;
      this.solicitudService.rechazarSolicitud(solicitud.id, resultado.texto).subscribe({
        next: (response) => {
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Solicitud Rechazada',
              title: 'Solicitud rechazada exitosamente',
              subtitle: response.mensaje || 'La solicitud ha sido rechazada.',
              type: 'success',
            },
          });
          this.loadSolicitudes();
        },
        error: (err) => {
          console.error('Error al rechazar solicitud:', err);
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Error',
              title: 'Error al rechazar la solicitud',
              subtitle: err.error?.error || 'No se pudo completar la operación.',
              type: 'error',
            },
          });
          this.loading = false;
        },
      });
    }
  });
}

/**
 * Enviar observaciones
 */
enviarObservaciones(solicitud: Solicitud) {
  if (!solicitud.id) return;

  // Abrir modal para capturar observaciones
  const dialogRef = this.dialog.open(ModalObservacionesSolicitudComponent, {
    width: '600px',
    disableClose: true,
    data: {
      tipo: 'observaciones',
      solicitudId: solicitud.id,
      nombreEmprendimiento: solicitud.emprendimientoId // o el nombre real si lo tienes
    }
  });

  dialogRef.afterClosed().subscribe((resultado) => {
    if (resultado) {
      this.loading = true;
      this.solicitudService.enviarObservaciones(solicitud.id, resultado.texto).subscribe({
        next: (response) => {
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Observaciones Enviadas',
              title: 'Observaciones enviadas exitosamente',
              subtitle: response.mensaje || 'Las observaciones han sido enviadas.',
              type: 'success',
            },
          });
          this.loadSolicitudes();
        },
        error: (err) => {
          console.error('Error al enviar observaciones:', err);
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Error',
              title: 'Error al enviar observaciones',
              subtitle: err.error?.error || 'No se pudo completar la operación.',
              type: 'error',
            },
          });
          this.loading = false;
        },
      });
    }
  });


}}