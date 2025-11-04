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
  // paging info from public API
  pageSize: number = 10;
  currentPage: number = 0;
  totalPages: number = 1;

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
        // Use public paginated API. Defaults: current month, page 0, size 10
        const currentMonth = new Date().getMonth() + 1; // JS months are 0-based
        const page = 0;
        const size = this.pageSize;
        this.eventoService.getPublicEvents({ mes: currentMonth, page, size }).subscribe({
          next: (res: any) => {
            // Response can be an array or a paginated object (content/data/result)
            let items: any[] = [];
            if (Array.isArray(res)) {
              items = res;
            } else if (res?.content && Array.isArray(res.content)) {
              items = res.content;
            } else if (res?.data && Array.isArray(res.data)) {
              items = res.data;
            } else if (res?.result && Array.isArray(res.result)) {
              items = res.result;
            } else if (res?.items && Array.isArray(res.items)) {
              items = res.items;
            }

            this.cardsArray = (items || []).map((it: any) => this.mapToCard(it));
            this.filtered = this.cardsArray.slice();
            // If server returns pagination metadata, adapt pageSize/currentPage/totalPages
            if (typeof res?.size === 'number') this.pageSize = Number(res.size);
            else if (res?.pageable?.pageSize) this.pageSize = Number(res.pageable.pageSize);
            if (typeof res?.number === 'number') this.currentPage = Number(res.number);
            else if (res?.pageable?.pageNumber) this.currentPage = Number(res.pageable.pageNumber || 0);
            const totalElements = (typeof res?.totalElements === 'number') ? Number(res.totalElements) : ((typeof res?.total === 'number') ? Number(res.total) : this.cardsArray.length);
            this.totalPages = Math.max(1, Math.ceil(totalElements / this.pageSize));
          },
          error: (err: any) => {
            console.warn('Error cargando eventos públicos desde backend', err);
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
