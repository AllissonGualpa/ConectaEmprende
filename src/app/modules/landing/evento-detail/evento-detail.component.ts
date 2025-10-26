import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-evento-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './evento-detail.component.html',
  styleUrl: './evento-detail.component.css'
})
export class EventoDetailComponent {

  event: EventoDetail | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private eventoService: EventoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de evento no proporcionado';
      return;
    }
    this.loadEvent(id);
  }

  private loadEvent(id: string) {
    this.isLoading = true;
    this.eventoService.getEventById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (!res) {
          this.error = 'Evento no encontrado';
          return;
        }
        //campos que vienen de la api papoi
        this.event = {
          id: res.idEvento ?? res.id ?? res._id ?? res.codigo,
          titulo: res.titulo ?? res.nombre,
          descripcion: res.descripcion,
          fechaEvento: res.fechaEvento ?? res.fecha,
          lugar: res.lugar ?? res.direccion ?? res.direccionEvento,
          tipoEvento: res.tipoEvento ?? res.tipo,
          linkInscripcion: res.linkInscripcion ?? res.link ?? res.url,
          direccion: res.direccion ?? res.lugar ?? '',
          imagenUrl: res.imagenUrl ?? res.imagen ?? res.urlImagen
        };
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = err?.message || 'Error cargando evento';
      }
    });
  }

  goBack() {
    this.router.navigate(['/eventos']);
  }
}
