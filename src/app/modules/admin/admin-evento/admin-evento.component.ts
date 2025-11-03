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
import { EventoDeleteComponent } from '../evento-delete/evento-delete.component';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';


interface Evento {
  id: string;
  organizador: string;
  //organizadorIcono: string;
  nombre: string;
  fecha: string;
  hora: string;
  estado: 'Activo' | 'En proceso' | 'Inactivo' | string;
  // additional fields from API
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
    NavbarAdminComponent
  ],
  templateUrl: './admin-evento.component.html',
  styleUrls: ['./admin-evento.component.css']
})
export class AdminEventoComponent {
  constructor(private dialog: MatDialog, private eventoService: EventoService) {}
  ngOnInit(): void {
    this.loadEventosFromServer();
  }
  searchText: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estadoSeleccionado: string = '';
  filteredEventos: Evento[] = [];
  // pagination
  pageSize: number = 10; // show 10 eventos per page
  pageIndex: number = 0; // current page index (0-based)
  pagedEventos: Evento[] = []; // slice of filteredEventos shown in table

  displayedColumns: string[] = ['id', 'organizador', 'nombre', 'fecha', 'hora' ,'action'];

  eventos: Evento[] = [
   
  ];

  constructorInit() {
    // initialize filtered list
    this.filteredEventos = this.eventos.slice();
  }

  private loadEventosFromServer(): void {
    // try to fetch from API; requires that EventoService.getEvents points to the correct endpoint
    this.eventoService.getEvents().subscribe({
      next: (res: any) => {
        try {
          // If the API returns an array directly
          const items = Array.isArray(res) ? res : (res?.data || res?.result || []);
          if (Array.isArray(items) && items.length > 0) {
            // Map the API items to our local Evento shape conservatively
            this.eventos = items.map((it: any) => {
              const fechaEvento = it.fechaEvento ? String(it.fechaEvento) : (it.fecha || '');
              // try to extract time part if present
              let horaStr = '';
              try {
                if (fechaEvento.includes('T')) {
                  horaStr = fechaEvento.split('T')[1].split(':').slice(0,2).join(':');
                } else if (it.horaInicio) {
                  horaStr = it.horaInicio;
                }
              } catch (e) { horaStr = it.hora || ''; }

              // derive and normalize tipoEvento: prefer explicit field, otherwise derive from direccion/lugar
              let rawTipo = it.tipoEvento || it.tipo || '';
              const lugarStr = String(it.direccion || it.lugar || '');
              if (!rawTipo && lugarStr.toLowerCase().includes('online')) rawTipo = 'Online';
              let tipoNorm = '';
              if (rawTipo) {
                const lt = String(rawTipo).toLowerCase();
                if (lt.includes('pres')) tipoNorm = 'Presencial';
                else if (lt.includes('onl') || lt.includes('vir')) tipoNorm = 'Online';
                else tipoNorm = String(rawTipo).charAt(0).toUpperCase() + String(rawTipo).slice(1);
              }

              return {
                id: it.idEvento ? String(it.idEvento) : (it.id ? String(it.id) : (it._id ? String(it._id) : `#${Math.floor(Math.random() * 90000) + 10000}`)),
                organizador: it.nombreEmprendimiento || it.organizador || it.usuario || 'Admin',
                organizadorIcono: it.organizadorIcono || 'person',
                nombre: it.titulo || it.nombre || 'Evento',
                fecha: fechaEvento.includes('T') ? fechaEvento.split('T')[0] : fechaEvento,
                hora: horaStr,
                // derive normalized estado: if activo is explicitly false prefer 'Cancelado', otherwise consider raw estado
                estado: ((): string => {
                  if (typeof it.activo === 'boolean' && it.activo === false) return 'Cancelado';
                  const rawEstado = it.estadoEvento || it.estado;
                  if (typeof rawEstado === 'string' && rawEstado.trim()) {
                    const r = rawEstado.toLowerCase();
                    if (r.includes('term') || r.includes('finish') || r.includes('completed')) return 'Terminado';
                    if (r.includes('cancel')) return 'Cancelado';
                    // default when explicit but unknown -> Programado
                    return 'Programado';
                  }
                  // fallback to activo boolean (true => Programado)
                  return (it.activo === true) ? 'Programado' : 'Cancelado';
                })(),
                descripcion: it.descripcion || '',
                horaInicio: it.horaInicio || (fechaEvento.includes('T') ? fechaEvento.split('T')[1] : undefined),
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
                fechaModificacion: it.fechaModificacion || undefined
              } as Evento;
            });
          }
        } catch (e) {
          console.warn('Error mapeando eventos', e);
        }
        this.applyFilters();
      },
      error: (err: any) => {
        console.warn('No se pudieron cargar eventos desde el servidor, usando datos locales.', err);
        this.applyFilters();
      }
    });
  }

  private parseEventDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    // try dd/MM/yyyy
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
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  applyFilters(): void {
    const q = (this.searchText || '').toLowerCase().trim();
    const hasQ = q.length > 0;
    const hasFechaInicio = !!this.fechaInicio;
    const hasFechaFin = !!this.fechaFin;
    const estadoSel = (this.estadoSeleccionado || '').toLowerCase();

    this.filteredEventos = this.eventos.filter(e => {
      // text search against nombre and organizador
      if (hasQ) {
        const hay = (e.nombre || '').toLowerCase().includes(q) || (e.organizador || '').toLowerCase().includes(q);
        if (!hay) return false;
      }

      // estado filter
      if (estadoSel) {
        const est = (e.estado || '').toLowerCase();
        if (!est.includes(estadoSel)) return false;
      }

      // date range filter
      if (hasFechaInicio || hasFechaFin) {
        const evtDate = this.parseEventDate(e.fecha);
        if (!evtDate) return false;
        if (hasFechaInicio && evtDate < this.startOfDay(this.fechaInicio!)) return false;
        if (hasFechaFin && evtDate > this.endOfDay(this.fechaFin!)) return false;
      }

      return true;
    });
    //paginacion (revisar)
    // reset to first page on new filter and compute paged results
    this.pageIndex = 0;
    this.updatePagedEventos();
  }
  private updatePagedEventos(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEventos = (this.filteredEventos || []).slice(start, end);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.filteredEventos?.length || 0) / this.pageSize));
  }

  goToPage(index: number): void {
    if (index < 0) index = 0;
    if (index >= this.totalPages) index = this.totalPages - 1;
    this.pageIndex = index;
    this.updatePagedEventos();
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.updatePagedEventos();
    }
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePagedEventos();
    }
  }

  //limpiar filtro

  clearFilters(): void {
    this.searchText = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.estadoSeleccionado = '';
    this.applyFilters();
  }

  getEstadoClass(estado: string): string {
    const s = String(estado || '').toLowerCase();
    switch(s) {
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
    const ref = this.dialog.open(EventoDeleteComponent, {
      width: '520px',
      data: {
        title: '¿Estás seguro de cancelar el evento seleccionado?',
        message: `Esta acción cancelará el evento ${evento.nombre}. Por favor, confirma que deseas proceder con la cancelación.`
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || undefined;
        // strip leading '#' from id if present before sending to backend
        const rawId = String(evento.id || '');
        const idToSend = rawId.startsWith('#') ? rawId.slice(1) : rawId;
        this.eventoService.inactivateEvent(idToSend, { token }).subscribe({
           next: (res: any) => {
             // update local object so UI reflects cancellation immediately
             evento.activo = false;
             evento.estado = 'Cancelado';
             this.applyFilters();
             // Show confirmation dialog
             this.dialog.open(MensajeConfirmacionComponent, { width: '420px', data: { subject: 'Evento', title: 'Evento cancelado', subtitle: `El evento '${evento.nombre}' fue cancelado.` } });
           },
           error: (err: any) => {
             console.warn('Error inactivando evento', err);
             // Optionally show an error dialog
             this.dialog.open(MensajeConfirmacionComponent, { width: '420px', data: { subject: 'Error', title: 'No se pudo cancelar el evento', subtitle: err?.message || 'Intenta nuevamente.' } });
           }
        });
      }
    });
  }

  abrirEditarEvento(evento: Evento): void {
    const ref = this.dialog.open(EventoCreateComponent, {
      width: '820px',
      maxWidth: '95vw',
      data: { mode: 'edit', event: evento }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        // The backend returned a successful update. Refresh the list from server
        // to make sure the UI reflects the authoritative data (avoids id/shape mismatches).
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
      width: '820px',
      maxWidth: '95vw',
      panelClass: 'evento-create-dialog'
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {

        let rawTipoRes = result.tipoEvento || result.tipo || '';
        const lugarRes = String(result.direccion || result.lugar || '');
        if (!rawTipoRes && lugarRes.toLowerCase().includes('online')) rawTipoRes = 'Online';
        let tipoNormRes = '';
        if (rawTipoRes) {
          const ltr = String(rawTipoRes).toLowerCase();
          if (ltr.includes('pres')) tipoNormRes = 'Presencial';
          else if (ltr.includes('onl') || ltr.includes('vir')) tipoNormRes = 'Online';
          else tipoNormRes = String(rawTipoRes).charAt(0).toUpperCase() + String(rawTipoRes).slice(1);
        }

        const newEvento: Evento = {
          id: result.idEvento ? String(result.idEvento) : (result.id ? String(result.id) : `#${Math.floor(Math.random() * 90000) + 10000}`),
          organizador: result.nombreEmprendimiento || result.organizador || 'Admin',
          //organizadorIcono: result.organizadorIcono || 'person',
          nombre: result.titulo || result.nombre || 'Nuevo Evento',
          fecha: result.fechaEvento ? (String(result.fechaEvento).includes('T') ? String(result.fechaEvento).split('T')[0] : String(result.fechaEvento)) : '',
          hora: result.hora || result.horaInicio || (result.fechaEvento && String(result.fechaEvento).includes('T') ? String(result.fechaEvento).split('T')[1].slice(0,5) : ''),
          estado: result.estadoEvento || result.estado || (result.activo ? 'Activo' : 'Inactivo') || 'Activo',
          descripcion: result.descripcion || '',
          horaInicio: result.horaInicio || undefined,
          horaFin: result.horaFin || undefined,
          direccion: result.direccion || result.lugar || '',
          linkInscripcion: result.linkInscripcion || result.link || '',
          tipoEvento: tipoNormRes,
          lugar: result.lugar || '',
          idEmprendimiento: result.idEmprendimiento || undefined,
          nombreEmprendimiento: result.nombreEmprendimiento || undefined,
          idMultimedia: result.idMultimedia || undefined,
          activo: typeof result.activo === 'boolean' ? result.activo : undefined,
          fechaCreacion: result.fechaCreacion || undefined,
          fechaModificacion: result.fechaModificacion || undefined
        };

        // Prepend to show newest first
        this.eventos = [newEvento, ...this.eventos];
        this.applyFilters();

        // show created dialog (pass subject so text can be customized)
        this.dialog.open(MensajeConfirmacionComponent, { width: '420px', data: { subject: 'Evento' } });
      }
    });
  }
  
}