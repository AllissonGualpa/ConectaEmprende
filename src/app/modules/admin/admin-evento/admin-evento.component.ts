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
import { EventoService } from '../evento.service';
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
  filteredEventos: Evento[] = [];

  pageSize: number = 5;
  currentPage: number = 0;
  totalElements: number = 0;
  totalPages: number = 0;
  pages: number[] = [];
  startIndex: number = 0;
  endIndex: number = 0;
  pagedEventos: Evento[] = [];

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

    this.eventoService
      .getAdminEvents({
        tipoEvento: undefined,
        fechaInicio: undefined,
        fechaFin: undefined,
        token,
      })
      .subscribe({
        next: (res: any) => {
          try {
            let items: any[] = [];
            if (Array.isArray(res)) items = res;
            else if (res?.content && Array.isArray(res.content))
              items = res.content;
            else if (res?.data && Array.isArray(res.data)) items = res.data;
            else if (res?.result && Array.isArray(res.result))
              items = res.result;
            else if (res?.items && Array.isArray(res.items)) items = res.items;

            this.eventos = (items || []).map((it: any) => {
              const fechaEvento = it.fechaEvento
                ? String(it.fechaEvento)
                : it.fecha || '';
              let horaStr = '';
              try {
                if (fechaEvento.includes('T')) {
                  horaStr = fechaEvento
                    .split('T')[1]
                    .split(':')
                    .slice(0, 2)
                    .join(':');
                } else if (it.horaInicio) {
                  horaStr = it.horaInicio;
                }
              } catch {
                horaStr = it.hora || '';
              }

              let rawTipo = it.tipoEvento || it.tipo || '';
              const lugarStr = String(it.direccion || it.lugar || '');
              if (!rawTipo && lugarStr.toLowerCase().includes('online'))
                rawTipo = 'Online';
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
                id: it.idEvento
                  ? String(it.idEvento)
                  : it.id
                  ? String(it.id)
                  : it._id
                  ? String(it._id)
                  : `#${Math.floor(Math.random() * 90000) + 10000}`,
                organizador:
                  it.nombreEmprendimiento ||
                  it.organizador ||
                  it.usuario ||
                  'Admin',
                nombre: it.titulo || it.nombre || 'Evento',
                fecha: fechaEvento.includes('T')
                  ? fechaEvento.split('T')[0]
                  : fechaEvento,
                hora: horaStr,
                estado: ((): string => {
                  if (typeof it.activo === 'boolean' && it.activo === false)
                    return 'Cancelado';
                  const rawEstado = it.estadoEvento || it.estado;
                  if (typeof rawEstado === 'string' && rawEstado.trim()) {
                    const r = rawEstado.toLowerCase();
                    if (
                      r.includes('term') ||
                      r.includes('finish') ||
                      r.includes('completed')
                    )
                      return 'Terminado';
                    if (r.includes('cancel')) return 'Cancelado';
                    return 'Programado';
                  }
                  return it.activo === true ? 'Programado' : 'Cancelado';
                })(),
                descripcion: it.descripcion || '',
                horaInicio:
                  it.horaInicio ||
                  (fechaEvento.includes('T')
                    ? fechaEvento.split('T')[1]
                    : undefined),
                horaFin: it.horaFin || undefined,
                direccion: it.direccion || it.lugar || '',
                linkInscripcion: it.linkInscripcion || it.link || '',
                tipoEvento: tipoNorm,
                lugar: it.lugar || it.direccion || '',
                idEmprendimiento: it.idEmprendimiento || undefined,
                nombreEmprendimiento: it.nombreEmprendimiento || undefined,
                idMultimedia: it.idMultimedia || undefined,
                activo: typeof it.activo === 'boolean' ? it.activo : undefined,
                fechaCreacion: it.fechaCreacion || undefined,
                fechaModificacion: it.fechaModificacion || undefined,
              } as Evento;
            });
          } catch (e) {
            console.warn('Error mapeando eventos', e);
          }

          this.applyFilters();
          this.loading = false;
        },
        error: (err: any) => {
          console.warn(
            'No se pudieron cargar eventos desde el servidor.',
            err
          );
          this.eventos = [];
          this.applyFilters();
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
    const q = (this.searchText || '').toLowerCase().trim();
    const hasQ = q.length > 0;
    const hasFechaInicio = !!this.fechaInicio;
    const hasFechaFin = !!this.fechaFin;
    const estadoSel = (this.estadoSeleccionado || '').toLowerCase();

    this.filteredEventos = this.eventos.filter((e) => {
      if (hasQ) {
        const hay =
          (e.nombre || '').toLowerCase().includes(q) ||
          (e.organizador || '').toLowerCase().includes(q);
        if (!hay) return false;
      }

      if (estadoSel) {
        const est = (e.estado || '').toLowerCase();
        if (!est.includes(estadoSel)) return false;
      }

      if (hasFechaInicio || hasFechaFin) {
        const evtDate = this.parseEventDate(e.fecha);
        if (!evtDate) return false;
        if (hasFechaInicio && evtDate < this.startOfDay(this.fechaInicio!))
          return false;
        if (hasFechaFin && evtDate > this.endOfDay(this.fechaFin!))
          return false;
      }

      return true;
    });

    this.currentPage = 0;
    this.computePaginationInfo();
  }

  private computePaginationInfo(): void {
    this.totalElements = this.filteredEventos.length;
    this.currentPage = Number(this.currentPage) || 0;
    this.pageSize = 5;

    this.totalPages =
      this.totalElements === 0
        ? 0
        : Math.ceil(this.totalElements / this.pageSize);

    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages - 1;
    }
    if (this.currentPage < 0) this.currentPage = 0;

    this.pages = Array.from({ length: Math.max(1, this.totalPages) }, (_, i) => i);

    if (this.totalElements === 0) {
      this.startIndex = 0;
      this.endIndex = 0;
      this.pagedEventos = [];
    } else {
      this.startIndex = this.currentPage * this.pageSize + 1;
      this.endIndex = Math.min(
        (this.currentPage + 1) * this.pageSize,
        this.totalElements
      );
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      this.pagedEventos = this.filteredEventos.slice(start, end);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.computePaginationInfo();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.computePaginationInfo();
    }
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.computePaginationInfo();
  }

  clearFilters(): void {
    this.searchText = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.estadoSeleccionado = '';
    this.applyFilters();
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
    console.log('Consultar eventos');
  }

  crearEvento(): void {
    console.log('Crear nuevo evento');
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
