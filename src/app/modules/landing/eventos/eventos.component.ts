import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component'; 
import { EventoService } from '../../admin/evento.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, SearchBarComponent, CardsComponent],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent implements OnInit {

  //SEARCH BAR
   onSearch(payload: { query: string; [key: string]: any }) {
    console.log('Búsqueda en Emprendimientos:', payload);

    let result = this.cardsArray.slice();

    // Query text filter
    const q = payload.query?.trim()?.toLowerCase();
    if (q) {
      result = result.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }

    // Date filter: payload['date'] is 'YYYY-MM-DD'
    if (payload['date']) {
      const payloadDate: string = payload['date'];
      result = result.filter(item => {
        if (!item.date) return false;
        let itemDateStr = '';
        if (typeof item.date === 'string') {
          itemDateStr = item.date;
        } else if (item.date instanceof Date) {
          itemDateStr = item.date.toISOString().slice(0, 10);
        } else {
          itemDateStr = new Date(item.date).toISOString().slice(0, 10);
        }
        return itemDateStr === payloadDate;
      });
    }

    // Location filter
    if (payload['location']) {
      result = result.filter(i => i.location === payload['location']);
    }

    // assign
    this.filtered = result;
  }

  // cards populated from backend
  cardsArray: CardItem[] = [];

  // filtered list (initially all items)
  filtered: CardItem[] = [];

  constructor(private eventoService: EventoService, private router: Router) {}

  ngOnInit(): void {
    this.loadEventosFromServer();
  }

  // manejadores emitidos por <app-cards>
  onDiscover(item: CardItem) {
    console.log('Descubrir item:', item);
    // navegar a la página de detalle del evento
    if (item && item.id != null) {
      this.router.navigate(['/eventos', item.id]);
    }
  }

  onToggleFavorite(item: CardItem) {
    console.log('Toggle favorito:', item);
    // lógica para marcar favorito (llamar API o cambiar estado local)
  }

    // handler para el botón Registrarse en eventos
    onRegister(item: CardItem) {
      console.log('Registrarse en evento:', item);
      // implementar lógica de registro (abrir modal, navegar, llamar API, etc.)
    }

    private loadEventosFromServer(): void {
      this.eventoService.getEvents().subscribe({
        next: (res: any) => {
          const items = Array.isArray(res) ? res : (res?.data || res?.result || []);
          this.cardsArray = (items || []).map((it: any) => this.mapToCard(it));
          this.filtered = this.cardsArray.slice();
        },
        error: (err: any) => {
          console.warn('Error cargando eventos desde backend, usando muestras locales', err);
          // keep filtered empty or fallback to existing hardcoded set if desired
          this.cardsArray = [];
          this.filtered = this.cardsArray.slice();
        }
      });
    }

    private mapToCard(it: any): CardItem {
      const id = it.idEvento ?? it.id ?? it._id ?? 0;
      const title = it.titulo || it.nombre || 'Evento';
      const description = it.descripcion || '';
      const image = it.imagenUrl || it.imagen || '/assets/img/eventos/foto1.png';
      const dateRaw = it.fechaEvento || it.fecha || undefined;
      const date = dateRaw && String(dateRaw).includes('T') ? String(dateRaw).split('T')[0] : dateRaw;
      const location = it.lugar || it.direccion || '';
      return { id: Number(id), title, description, image, date, location } as CardItem;
    }
}
