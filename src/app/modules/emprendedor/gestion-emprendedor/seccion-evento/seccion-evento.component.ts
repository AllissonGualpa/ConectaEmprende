import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-seccion-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent],
  templateUrl: './seccion-evento.component.html',
  styleUrl: './seccion-evento.component.css'
})
export class SeccionEventoComponent {
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  estadoSeleccionado: string = '';

  onSearch(payload: any) {
    // por ahora sólo logueamos; conectar con tu servicio de eventos para filtrar
    console.log('Search payload recibido en SeccionEventoComponent:', payload);
  }

  consultar() {
    const payload = {
      query: '',
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      estado: this.estadoSeleccionado
    };
    console.log('Consultar con payload:', payload);
    this.onSearch(payload);
  }

  abrirCrear() {
    // Hook para abrir diálogo de crear evento; por ahora sólo log
    console.log('Abrir crear evento (placeholder)');
  }
}
