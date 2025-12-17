// card-event.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventoCard {
  id?: number;
  titulo: string;
  descripcion: string;
  fechaEvento: string;
  horario?: string;
  lugar?: string;
  tipoEvento: string;
  estadoEvento: string;
  urlMultimedia: string;
}

@Component({
  selector: 'app-card-event',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-event.component.html'
})
export class CardEventComponent {
  @Input() evento!: EventoCard;
  @Input() showActions: boolean = true;
  
  @Output() eliminar = new EventEmitter<EventoCard>();
  @Output() editar = new EventEmitter<EventoCard>();

  get estadoClass(): string {
    const estado = this.evento.estadoEvento.toLowerCase();
    if (estado.includes('programado')) return 'bg-green-100 text-green-700';
    if (estado.includes('finalizado')) return 'bg-blue-100 text-blue-700';
    if (estado.includes('cancelado')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  get isEventoCancelado(): boolean {
    return this.evento.estadoEvento.toLowerCase().includes('cancelado');
  }

  formatearFecha(fecha: string): { dia: string; mes: string } {
    const date = new Date(fecha);
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return {
      dia: date.getDate().toString().padStart(2, '0'),
      mes: meses[date.getMonth()]
    };
  }

  onCancelar(): void {
    if (!this.isEventoCancelado) {
      this.eliminar.emit(this.evento);
    }
  }

  onEditar(): void {
    if (!this.isEventoCancelado) {
      this.editar.emit(this.evento);
    }
  }
}