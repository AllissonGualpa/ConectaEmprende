import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventoCreateComponent } from '../../../admin/evento-create/evento-create.component';
import { CardsComponent, CardItem } from '../../../../layout/cards/cards.component';
import { EventoService } from '../../../admin/evento.service';
import { MensajeConfirmacionComponent } from '../../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

@Component({
  selector: 'app-seccion-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, CardsComponent, MatDialogModule],
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
    const ref = this.dialog.open(EventoCreateComponent, {
      width: '820px',
      maxWidth: '95vw',
      panelClass: 'evento-create-dialog'
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        // Map the returned result to CardItem and prepend so it appears immediately
        const id = result.idEvento ? String(result.idEvento) : (result.id ? String(result.id) : `#${Math.floor(Math.random() * 90000) + 10000}`);
        const title = result.titulo || result.nombre || 'Nuevo Evento';
        const description = result.descripcion || '';
        const image = result.imagenUrl || result.imagen || '/assets/img/emprendimiento/foto1.png';
        const location = result.lugar || result.direccion || '';
        const dateRaw = result.fechaEvento || result.fecha || '';
        const date = String(dateRaw).includes('T') ? String(dateRaw).split('T')[0] : dateRaw;

        const newCard: CardItem = {
          id: Number(String(id).replace('#', '')) || 0,
          title,
          description,
          image,
          location,
          date
        };

        // keep raw map too
        this.rawMap[String(newCard.id)] = result;

        // Prepend so newest appear first
        this.eventos = [newCard, ...this.eventos];

        // show created dialog (same as admin)
        this.dialog.open(MensajeConfirmacionComponent, { width: '420px', data: { subject: 'Evento' } });
      }
    });
  }

  // events list for cards
  eventos: CardItem[] = [];
  // keep original raw items by id so we can open edit dialog with full data
  private rawMap: Record<string, any> = {};

  constructor(private eventoService: EventoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadEventos();
  }

  private loadEventos(): void {
    this.eventoService.getEvents().subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : (res?.data || res?.result || []);
        this.rawMap = {};
        this.eventos = (items || []).map((it: any) => {
          const card = this.mapToCard(it);
          this.rawMap[String(card.id)] = it;
          return card;
        });
      },
      error: (err: any) => {
        console.warn('No se pudieron cargar eventos en SeccionEvento:', err);
        this.eventos = [];
      }
    });
  }

  private mapToCard(it: any): CardItem {
    const id = it.idEvento ?? it.id ?? it._id ?? 0;
    const title = it.titulo || it.nombre || 'Evento';
    const description = it.descripcion || '';
    const image = it.imagenUrl || it.imagen || '/assets/img/emprendimiento/foto1.png';
    const location = it.lugar || it.direccion || 'Lugar por definir';
    const date = it.fechaEvento || it.fecha || undefined;
    return {
      id: Number(id),
      title,
      description,
      image,
      location,
      date
    } as CardItem;
  }

  // actions from cards
  onDiscover(item: CardItem) {
    console.log('Discover', item);
  }

  onRegister(item: CardItem) {
    console.log('Register', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Toggle favorite', item);
  }

  editarEvento(item: CardItem) {
    // Open edit dialog using the raw API item so the form can be prefilled correctly
    const raw = this.rawMap[String(item.id)];
    if (!raw) {
      console.warn('No se encontró el raw item para editar', item);
      return;
    }

    const ref = this.dialog.open(EventoCreateComponent, {
      width: '820px',
      maxWidth: '95vw',
      data: { mode: 'edit', event: raw }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        // show confirmation using server response title (titulo or nombre)
        const newTitle = result.titulo || result.nombre || '';
        this.dialog.open(MensajeConfirmacionComponent, {
          width: '420px',
          data: { title: 'Evento editado exitosamente', subtitle: newTitle }
        });

        // reload from server to reflect authoritative changes
        this.loadEventos();
      }
    });
  }

  eliminarEvento(item: CardItem) {
    // inactivar evento en backend
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || undefined;
    this.eventoService.inactivateEvent(item.id, { token }).subscribe({
      next: () => {
        // recargar lista
        this.loadEventos();
      },
      error: (err) => console.warn('Error inactivando desde seccion-evento', err)
    });
  }
}
