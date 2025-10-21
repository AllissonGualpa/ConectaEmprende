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
    FormsModule,
    NavbarAdminComponent
  ],
  templateUrl: './admin-evento.component.html',
  styleUrls: ['./admin-evento.component.css']
})
export class AdminEventoComponent {
  searchText: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estadoSeleccionado: string = '';


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
    console.log('Editar:', evento);
  }

  eliminarEvento(evento: Evento): void {
    console.log('Eliminar:', evento);
  }

  consultar(): void {
    console.log('Consultar eventos');
  }

  crearEvento(): void {
    console.log('Crear nuevo evento');
  }
  
}