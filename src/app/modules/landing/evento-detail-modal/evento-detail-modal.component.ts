import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../admin/evento.service';

interface EventoDetail {
  id?: number | string;
  titulo?: string;
  descripcion?: string;
  fechaEvento?: string;
  lugar?: string;
  tipoEvento?: string;
  linkInscripcion?: string;
  direccion?: string;
  imagenUrl?: string;
}

@Component({
  selector: 'app-evento-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evento-detail-modal.component.html'
})
export class EventoDetailModalComponent {

  @Input() eventId!: number;
  @Output() close = new EventEmitter<void>();

  event: EventoDetail | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private eventoService: EventoService) {}

  ngOnInit() {
    if (this.eventId) {
      this.loadEvent(this.eventId);
    }
  }

  private loadEvent(id: number) {
    this.isLoading = true;
    this.eventoService.getEventById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.event = {
          id: res.idEvento ?? res.id,
          titulo: res.titulo ?? res.nombre,
          descripcion: res.descripcion,
          fechaEvento: res.fechaEvento ?? res.fecha,
          lugar: res.lugar ?? res.direccion,
          tipoEvento: res.tipoEvento ?? res.tipo,
          linkInscripcion: res.linkInscripcion ?? res.link,
          direccion: res.direccion,
          imagenUrl: res.urlMultimedia
        };
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Error cargando evento';
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}
