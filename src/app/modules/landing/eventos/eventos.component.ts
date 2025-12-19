import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component'; 
import { EventoService } from '../../admin/evento.service';
import { EventoDetailModalComponent } from '.././evento-detail-modal/evento-detail-modal.component';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    CardsComponent,
    EventoDetailModalComponent
  ],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent implements OnInit {

  showEventModal: boolean = false;
  selectedEventId: number | null = null;
  cardsArray: CardItem[] = [];
  filtered: CardItem[] = [];
  pageSize: number = 10;
  currentPage: number = 0;
  totalPages: number = 1;

  constructor(private eventoService: EventoService) {}

  ngOnInit(): void {
    this.loadEventosFromServer();
  }

  onSearch(payload: { query: string; [key: string]: any }) {
    const params: any = {};

    if (payload.query) {
      params.titulo = payload.query;
    }

    if (payload['month']) {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];

      const payloadMonthStr = String(payload['month'])
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const mesesNormalizados = meses.map(m =>
        m.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      );

      const idx = mesesNormalizados.indexOf(payloadMonthStr);
      if (idx >= 0) params.mes = idx + 1;
    }

    params.page = 0;
    params.size = this.pageSize;

    this.eventoService.getPublicEvents(params).subscribe({
      next: (res: any) => {
        let items: any[] = [];

        if (Array.isArray(res)) items = res;
        else if (res?.content) items = res.content;
        else if (res?.data) items = res.data;
        else if (res?.result) items = res.result;
        else if (res?.items) items = res.items;

        this.cardsArray = (items || []).map(it => this.mapToCard(it));
        this.filtered = this.cardsArray.slice();

        const total = res?.totalElements ?? res?.total ?? this.cardsArray.length;
        this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
      },
      error: err => {
        console.warn('Error cargando eventos', err);
        this.cardsArray = [];
        this.filtered = [];
      }
    });
  }

  // EVENT HANDLERS
  onDiscover(item: CardItem) {
    if (!item || item.id == null) return;

    this.selectedEventId = item.id;
    this.showEventModal = true;
  }

  closeEventModal() {
    this.showEventModal = false;
    this.selectedEventId = null;
  }

  onToggleFavorite(item: CardItem) {
    console.log('Toggle favorito:', item);
  }

  onRegister(item: CardItem) {
    this.onDiscover(item);
  }

  // LOAD EVENTS
  private loadEventosFromServer(): void {
    const currentMonth = new Date().getMonth() + 1;

    this.eventoService.getPublicEvents({
      mes: currentMonth,
      page: 0,
      size: this.pageSize
    }).subscribe({
      next: (res: any) => {
        let items: any[] = [];

        if (Array.isArray(res)) items = res;
        else if (res?.content) items = res.content;
        else if (res?.data) items = res.data;
        else if (res?.result) items = res.result;
        else if (res?.items) items = res.items;

        this.cardsArray = (items || []).map(it => this.mapToCard(it));
        this.filtered = this.cardsArray.slice();

        const total = res?.totalElements ?? res?.total ?? this.cardsArray.length;
        this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
      },
      error: err => {
        console.warn('Error cargando eventos públicos', err);
        this.cardsArray = [];
        this.filtered = [];
      }
    });
  }

  private mapToCard(it: any): CardItem {
    const id = it.idEvento ?? it.id ?? it._id ?? 0;
    const title = it.titulo || it.nombre || 'Evento';
    const description = it.descripcion || '';
    const image = it.imagenUrl || it.urlMultimedia || '/assets/img/eventos/foto1.png';
    const dateRaw = it.fechaEvento || it.fecha;
    const date = dateRaw && String(dateRaw).includes('T')
      ? String(dateRaw).split('T')[0]
      : dateRaw;
    const location = it.lugar || it.direccion || '';

    return {
      id: Number(id),
      title,
      description,
      image,
      date,
      location
    } as CardItem;
  }
}
