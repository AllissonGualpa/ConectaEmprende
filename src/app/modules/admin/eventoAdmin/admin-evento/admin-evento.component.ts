import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetailEventAdminComponent } from '../detail-event-admin/detail-event-admin.component';
import { NavbarAdminComponent } from '../../../../layout/navbar-admin/navbar-admin.component';
import { AdminEventoItemDto, AdminEventosResponseDto, EventoService } from '../../evento.service';
import { MensajeConfirmacionComponent } from '../../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { AllEmprendimientoSelectorComponent } from '../../../../shared/all-emprendimiento-selector/all-emprendimiento-selector.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    FormsModule,
    ReactiveFormsModule,
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
    NavbarAdminComponent,
    AllEmprendimientoSelectorComponent,
  ],
  templateUrl: './admin-evento.component.html',
  styleUrls: ['./admin-evento.component.css'],
})
export class AdminEventoComponent implements OnInit {
  filtrosForm!: FormGroup;
  
  loading = false;

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

  // Opciones para los selectores
  estadosOptions = [
    { value: 'PROGRAMADO', label: 'Programado' },
    { value: 'TERMINADO', label: 'Terminado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  tiposOptions = [
    { value: 'PRESENCIAL', label: 'Presencial' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'HIBRIDO', label: 'Híbrido' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private eventoService: EventoService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadEventosFromServer();
  }

  private initForm(): void {
    this.filtrosForm = this.fb.group({
      titulo: [''],
      fechaInicio: [null],
      fechaFin: [null],
      estado: [''],
      tipoEvento: [''],
      idEmprendimiento: [null]
    });
  }

  onEmprendimientoSelected(idEmprendimiento: number | null): void {
    this.filtrosForm.patchValue({ idEmprendimiento });
  }

  aplicarFiltros(): void {
    this.currentPage = 0;
    this.loadEventosFromServer();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      titulo: '',
      fechaInicio: null,
      fechaFin: null,
      estado: '',
      tipoEvento: '',
      idEmprendimiento: null
    });
    this.currentPage = 0;
    this.loadEventosFromServer();
  }

  private loadEventosFromServer(): void {
    this.loading = true;

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken') ||
      undefined;

    const formValues = this.filtrosForm.value;

    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
      token
    };

    if (formValues.titulo?.trim()) {
      params.titulo = formValues.titulo.trim();
    }

    if (formValues.fechaInicio) {
      params.fechaInicio = this.startOfDay(formValues.fechaInicio).toISOString();
    }

    if (formValues.fechaFin) {
      params.fechaFin = this.endOfDay(formValues.fechaFin).toISOString();
    }

    if (formValues.estado) {
      params.estado = formValues.estado;
    }

    if (formValues.tipoEvento) {
      params.tipoEvento = formValues.tipoEvento;
    }

    if (formValues.idEmprendimiento) {
      params.idEmprendimiento = formValues.idEmprendimiento;
    }

    this.eventoService.getAdminEvents(params).subscribe({
      next: (res: AdminEventosResponseDto) => {
        try {
          const items: AdminEventoItemDto[] = res.content || [];
          const pageable = res.pageable;

          if (pageable) {
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

            if (
              typeof pageable.lastPage === 'number' &&
              pageable.lastPage >= 0
            ) {
              this.totalPages = pageable.lastPage + 1;
            } else {
              this.totalPages =
                this.pageSize > 0
                  ? Math.ceil(this.totalElements / this.pageSize)
                  : 1;
            }
          } else {
            this.totalElements = items.length;
            this.totalPages =
              this.pageSize > 0
                ? Math.ceil(this.totalElements / this.pageSize)
                : 1;
          }

          if (this.totalPages === 0 && this.totalElements > 0) {
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

  // Método para cancelar permanentemente (círculo con X naranja)
  inactivarEvento(evento: Evento): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: '¿Cancelar evento?',
        message: `¿Estás seguro de que deseas cancelar el evento "${evento.nombre}"? Esta acción es permanente.`,
        confirmText: 'Sí, cancelar',
        cancelText: 'No, volver'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.ejecutarCancelacionPermanente(evento);
      }
    });
  }

  private ejecutarCancelacionPermanente(evento: Evento): void {
    const token = localStorage.getItem('token') || undefined;
    const idToSend = String(evento.id).startsWith('#')
      ? evento.id.slice(1)
      : evento.id;

    this.loading = true;

    this.eventoService.inactivateEvent(idToSend, { token }).subscribe({
      next: () => {
        evento.activo = false;
        evento.estado = 'Cancelado';
        this.dialog.open(MensajeConfirmacionComponent, {
          width: '420px',
          data: {
            subject: 'Evento',
            title: 'Evento cancelado exitosamente',
            type: 'success',
          },
        });
        this.loadEventosFromServer();
        this.loading = false;
      },
      error: (err) => {
        console.warn('Error cancelando evento', err);
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
        this.loading = false;
      },
    });
  }

  // Método para toggle activate/inactivate (basura roja/check verde)
  cancelarEvento(evento: Evento): void {
    const accion = evento.activo ? 'inactivar' : 'activar';
    const accionTitulo = evento.activo ? 'Inactivar' : 'Activar';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `¿${accionTitulo} evento?`,
        message: evento.activo 
          ? `¿Estás seguro de que deseas inactivar el evento "${evento.nombre}"? Podrás reactivarlo después.`
          : `¿Estás seguro de que deseas activar el evento "${evento.nombre}"? Volverá a estar disponible para los usuarios.`,
        confirmText: `Sí, ${accion}`,
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.ejecutarToggleActivacion(evento);
      }
    });
  }

  private ejecutarToggleActivacion(evento: Evento): void {
    const token = localStorage.getItem('token') || undefined;
    const idToSend = String(evento.id).startsWith('#')
      ? evento.id.slice(1)
      : evento.id;

    this.loading = true;

    if (evento.activo == true) {
      // Si está activo, inactivar
      this.eventoService.inactivateEvent(idToSend, { token }).subscribe({
        next: () => {
          evento.activo = false;
          this.aplicarFiltros();
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Evento inactivado',
              type: 'success',
            },
          });
          this.loading = false;
        },
        error: (err) => {
          console.warn('Error inactivando evento', err);
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Error al inactivar el evento',
              subtitle:
                'No se pudo completar la operación. Por favor, inténtalo nuevamente.',
              type: 'error',
            },
          });
          this.loading = false;
        },
      });
    } else {
      // Si está inactivo, activar
      this.eventoService.activateEvent(idToSend, { token }).subscribe({
        next: () => {
          evento.activo = true;
          this.aplicarFiltros();
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Evento activado',
              type: 'success',
            },
          });
          this.loading = false;
        },
        error: (err) => {
          console.warn('Error activando evento', err);
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Error al activar el evento',
              subtitle:
                'No se pudo completar la operación. Por favor, inténtalo nuevamente.',
              type: 'error',
            },
          });
          this.loading = false;
        },
      });
    }
    this.loadEventosFromServer();
  }

  abrirEditarEvento(evento: Evento): void {
    const ref = this.dialog.open(DetailEventAdminComponent, {
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

  abrirCrearEvento(): void {
    const ref = this.dialog.open(DetailEventAdminComponent, {
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