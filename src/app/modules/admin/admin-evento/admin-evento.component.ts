import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventoService, AdminEventosResponseDto, AdminEventoItemDto } from '../evento.service';
import { EventoCreateComponent } from '../../admin/evento-create/evento-create.component';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

interface Evento {
  id: string;
  organizador: string;
  nombre: string;
  fecha: string;
  hora: string;
  estado: 'Activo' | 'En proceso' | 'Inactivo' | string;
  descripcion?: string;
  horaInicio?: string;
  horaFin?: string;
  direccion?: string;
  linkInscripcion?: string;
  tipoEvento?: string;
  lugar?: string;
  idEmprendimiento?: number;
  nombreEmprendimiento?: string;
  idMultimedia?: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string | null;
}

@Component({
  selector: 'app-admin-evento',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatDialogModule,
    FormsModule,
    NavbarAdminComponent,
  ],
  templateUrl: './admin-evento.component.html',
  styleUrls: ['./admin-evento.component.css'],
})
export class AdminEventoComponent {
  constructor(
    private dialog: MatDialog,
    private eventoService: EventoService
  ) {}
  ngOnInit(): void {
    this.loadEventosFromServer();
  }

  loading = false;

  searchText: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estadoSeleccionado: string = '';

  pageSize: number = 5;
  currentPage: number = 0;
  totalElements: number = 0;
  totalPages: number = 0;
  pages: number[] = [];
  startIndex: number = 0;
  endIndex: number = 0;

  displayedColumns: string[] = [
    'id',
    'organizador',
    'nombre',
    'fecha',
    'hora',
    'action',
  ];

  eventos: Evento[] = [];

  eventoAEliminar: Evento | null = null;

  private loadEventosFromServer(): void {
    this.loading = true;

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken') ||
      undefined;

    const tipoEventoFilter = this.estadoSeleccionado || undefined;
    const fechaInicioStr = this.fechaInicio
      ? this.startOfDay(this.fechaInicio).toISOString()
      : undefined;
    const fechaFinStr = this.fechaFin
      ? this.endOfDay(this.fechaFin).toISOString()
      : undefined;

    this.eventoService
      .getAdminEvents({
        estado: tipoEventoFilter,
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        page: this.currentPage,
        size: this.pageSize,
        token,
      })
      .subscribe({
        next: (res: AdminEventosResponseDto) => {
          try {
            const items: AdminEventoItemDto[] = res.content || [];
            const pageable = res.pageable;

            if (pageable) {
              // Normalizar valores de paginación
              this.totalElements =
                typeof pageable.length === 'number' && pageable.length >= 0
                  ? pageable.length
                  : items.length;
              this.pageSize =
                typeof pageable.size === 'number' && pageable.size > 0
                  ? pageable.size
                  : this.pageSize;
              this.currentPage =
                typeof pageable.page === 'number' && pageable.page >= 0
                  ? pageable.page
                  : 0;

              // Si lastPage viene como índice base 0
              if (
                typeof pageable.lastPage === 'number' &&
                pageable.lastPage >= 0
              ) {
                this.totalPages = pageable.lastPage + 1;
              } else {
                // Fallback si no viene lastPage
                this.totalPages =
                  this.pageSize > 0
                    ? Math.ceil(this.totalElements / this.pageSize)
                    : 1;
              }
            } else {
              // Fallback si no viene pageable
              this.totalElements = items.length;
              this.totalPages =
                this.pageSize > 0
                  ? Math.ceil(this.totalElements / this.pageSize)
                  : 1;
            }

            if (this.totalPages === 0 && this.totalElements > 0) {
              // Si hay elementos pero totalPages terminó en 0, forzar 1
              this.totalPages = 1;
            }

            this.eventos = items.map((it) => {
              const fechaEvento = String(it.fechaEvento || '');
              let horaStr = '';
              try {
                if (fechaEvento.includes('T')) {
                  horaStr = fechaEvento
                    .split('T')[1]
                    .split(':')
                    .slice(0, 2)
                    .join(':');
                }
              } catch {
                horaStr = '';
              }

              let rawTipo = it.tipoEvento || '';
              let tipoNorm = '';
              if (rawTipo) {
                const lt = String(rawTipo).toLowerCase();
                if (lt.includes('pres')) tipoNorm = 'Presencial';
                else if (lt.includes('onl') || lt.includes('vir'))
                  tipoNorm = 'Online';
                else
                  tipoNorm =
                    String(rawTipo).charAt(0).toUpperCase() +
                    String(rawTipo).slice(1);
              }

              return {
                id: String(it.idEvento),
                organizador: it.nombreEmprendimiento || 'Admin',
                nombre: it.titulo || 'Evento',
                fecha: fechaEvento.includes('T')
                  ? fechaEvento.split('T')[0]
                  : fechaEvento,
                hora: horaStr,
                estado: ((): string => {
                  if (it.activo === false) return 'Cancelado';
                  const rawEstado = it.estadoEvento;
                  if (typeof rawEstado === 'string' && rawEstado.trim()) {
                    const r = rawEstado.toLowerCase();
                    if (r.includes('term')) return 'Terminado';
                    if (r.includes('cancel')) return 'Cancelado';
                    return 'Programado';
                  }
                  return it.activo === true ? 'Programado' : 'Cancelado';
                })(),
                descripcion: '',
                horaInicio: horaStr || undefined,
                horaFin: undefined,
                direccion: '',
                linkInscripcion: '',
                tipoEvento: tipoNorm,
                lugar: '',
                idEmprendimiento: it.idEmprendimiento || undefined,
                nombreEmprendimiento: it.nombreEmprendimiento || undefined,
                idMultimedia: undefined,
                activo: it.activo,
                fechaCreacion: it.fechaCreacion || undefined,
                fechaModificacion: undefined,
              } as Evento;
            });

            this.computePaginationInfo();
          } catch (e) {
            console.warn('Error mapeando eventos', e);
            this.eventos = [];
            this.totalElements = 0;
            this.totalPages = 0;
            this.computePaginationInfo();
          }

          this.loading = false;
        },
        error: (err: any) => {
          console.warn(
            'No se pudieron cargar eventos desde el servidor.',
            err
          );
          this.eventos = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.computePaginationInfo();
          this.loading = false;
        },
      });
  }

  private parseEventDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const d = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const y = Number(parts[2]);
        const dt = new Date(y, m, d);
        if (!isNaN(dt.getTime())) return dt;
      }
    }
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? null : dt;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  private endOfDay(d: Date): Date {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      23,
      59,
      59,
      999
    );
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadEventosFromServer();
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

    // Si totalPages no viene o es 0, calcularlo
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
      this.loadEventosFromServer();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadEventosFromServer();
    }
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadEventosFromServer();
  }

  clearFilters(): void {
    this.searchText = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.estadoSeleccionado = '';
    this.currentPage = 0;
    this.loadEventosFromServer();
  }

  getEstadoClass(estado: string): string {
    const s = String(estado || '').toLowerCase();
    switch (s) {
      case 'programado':
        return 'bg-green-100 text-green-700';
      case 'terminado':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  }

  editarEvento(evento: Evento): void {
    this.abrirEditarEvento(evento);
  }

  eliminarEvento(evento: Evento): void {
    this.abrirEliminarEvento(evento);
  }

  abrirEliminarEvento(evento: Evento): void {
    this.eventoAEliminar = evento;
  }

  closeDeleteDialog(): void {
    this.eventoAEliminar = null;
  }

  confirmDelete(evento: Evento): void {
    const token = localStorage.getItem('token') || undefined;
    const idToSend = String(evento.id).startsWith('#')
      ? evento.id.slice(1)
      : evento.id;

    this.loading = true;

    if (evento.activo == true) {
      this.eventoService.inactivateEvent(idToSend, { token }).subscribe({
        next: () => {
          evento.activo = false;
          this.applyFilters();
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Evento cancelado',
              type: 'success',
            },
          });
          this.closeDeleteDialog();
          this.loading = false;
        },
        error: (err) => {
          console.warn('Error inactivando evento', err);
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Error al cancelar el evento',
              subtitle:
                'No se pudo completar la operación. Por favor, inténtalo nuevamente.',
              type: 'error',
            },
          });
          this.closeDeleteDialog();
          this.loading = false;
        },
      });
    } else {
      this.eventoService.activateEvent(idToSend, { token }).subscribe({
        next: () => {
          evento.activo = true;
          this.applyFilters();
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Evento activado',
              type: 'success',
            },
          });
          this.closeDeleteDialog();
          this.loading = false;
        },
        error: (err) => {
          console.warn('Error activando evento', err);
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Error al cancelar el evento',
              subtitle:
                'No se pudo completar la operación. Por favor, inténtalo nuevamente.',
              type: 'error',
            },
          });
          this.closeDeleteDialog();
          this.loading = false;
        },
      });
    }
    this.loadEventosFromServer();
  }

  abrirEditarEvento(evento: Evento): void {
    const ref = this.dialog.open(EventoCreateComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { mode: 'edit', event: evento },
      panelClass: 'evento-create-dialog',
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loading = true;
        this.loadEventosFromServer();
      }
    });
  }

  consultar(): void {
    this.currentPage = 0;
    this.loadEventosFromServer();
  }

  abrirCrearEvento(): void {
    const ref = this.dialog.open(EventoCreateComponent, {
      width: '1000px',
      maxWidth: '95vw',
      panelClass: 'evento-create-dialog',
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loading = true;
        this.loadEventosFromServer();
        this.dialog.open(MensajeConfirmacionComponent, {
          width: '420px',
          data: { subject: 'Evento' },
        });
      }
    });
  }
}
