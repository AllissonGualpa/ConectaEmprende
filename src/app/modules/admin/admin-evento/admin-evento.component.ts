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
import { EventoCreateComponent } from '../../admin/evento-create/evento-create.component';
import { EventoDeleteComponent } from '../evento-delete/evento-delete.component';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';


interface Evento {
  id: string;
  organizador: string;
  organizadorIcono: string;
  nombre: string;
  fecha: string;
  hora: string;
  estado: 'Activo' | 'En proceso' | 'Inactivo';
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
  constructor(private dialog: MatDialog) {}
  ngOnInit(): void {
    this.applyFilters();
  }
  searchText: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estadoSeleccionado: string = '';
  filteredEventos: Evento[] = [];


  displayedColumns: string[] = ['id', 'organizador', 'nombre', 'fecha', 'hora' ,'action'];

  eventos: Evento[] = [
    {
      id: '#20462',
      organizador: 'Hat',
      organizadorIcono: '🎩',
      nombre: 'Matt Dickerson',
      fecha: '13/05/2022',
      hora: '9:30 AM',
      estado: 'Activo'
    },
    {
      id: '#18933',
      organizador: 'Laptop',
      organizadorIcono: '💻',
      nombre: 'Wiktoria',
      fecha: '22/05/2022',
      hora: '11:00 AM',
      estado: 'Activo'
    },
    {
      id: '#45169',
      organizador: 'Phone',
      organizadorIcono: '📱',
      nombre: 'Trixie Byrd',
      fecha: '15/06/2022',
      hora: '6:15 PM',
      estado: 'En proceso'
    },
    {
      id: '#44304',
      organizador: 'Bag',
      organizadorIcono: '👜',
      nombre: 'Brad Mason',
      fecha: '06/09/2022',
      hora: '10:00 AM',
      estado: 'En proceso'
    },
    {
      id: '#17188',
      organizador: 'Headset',
      organizadorIcono: '🎧',
      nombre: 'Sanderson',
      fecha: '25/09/2022',
      hora: '3:45 PM',
      estado: 'Inactivo'
    },
    {
      id: '#73003',
      organizador: 'Mouse',
      organizadorIcono: '🖱️',
      nombre: 'Jun Redfern',
      fecha: '04/10/2022',
      hora: '12:30 PM',
      estado: 'Activo'
    },
    {
      id: '#58825',
      organizador: 'Clock',
      organizadorIcono: '⏰',
      nombre: 'Miriam Kidd',
      fecha: '17/10/2022',
      hora: '8:00 AM',
      estado: 'Activo'
    },
    {
      id: '#44122',
      organizador: 'T-shirt',
      organizadorIcono: '👕',
      nombre: 'Dominic',
      fecha: '24/10/2022',
      hora: '4:20 PM',
      estado: 'Activo'
    },
    {
      id: '#89094',
      organizador: 'Monitor',
      organizadorIcono: '🖥️',
      nombre: 'Shanice',
      fecha: '01/11/2022',
      hora: '2:10 PM',
      estado: 'Inactivo'
    },
    {
      id: '#80252',
      organizador: 'Keyboard',
      organizadorIcono: '⌨️',
      nombre: 'Poppy-Rose',
      fecha: '22/11/2022',
      hora: '5:55 PM',
      estado: 'En proceso'
    }
  ];

  constructorInit() {
    // initialize filtered list
    this.filteredEventos = this.eventos.slice();
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
  }

  clearFilters(): void {
    this.searchText = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.estadoSeleccionado = '';
    this.applyFilters();
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'Activo':
        return 'bg-green-100 text-green-700';
      case 'En proceso':
        return 'bg-yellow-100 text-yellow-700';
      case 'Inactivo':
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
        title: '¿Estás seguro de eliminar el evento seleccionado?',
        message: `Esta acción eliminará permanentemente toda la información asociada al evento '${evento.nombre}'. Por favor, confirma que deseas proceder con la eliminación.`
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // eliminar del array
        this.eventos = this.eventos.filter(e => e.id !== evento.id);
        this.applyFilters();
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
        // update the event in the array
        this.eventos = this.eventos.map(e => e.id === result.id ? { ...e, ...result } : e);
        this.applyFilters();
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
        // The API response might include the created event with id and other fields.
        // Push the new event into the list so it appears in the admin table.
        // Map fields if needed to match local Evento interface.
        const newEvento: Evento = {
          id: result.id ? String(result.id) : `#${Math.floor(Math.random() * 90000) + 10000}`,
          organizador: result.organizador || 'Admin',
          organizadorIcono: result.organizadorIcono || '🟢',
          nombre: result.titulo || result.nombre || 'Nuevo Evento',
          fecha: result.fechaEvento ? (String(result.fechaEvento).includes('T') ? String(result.fechaEvento).split('T')[0] : String(result.fechaEvento)) : '',
          hora: result.hora || result.horaInicio || '',
          estado: result.estado || 'Activo'
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