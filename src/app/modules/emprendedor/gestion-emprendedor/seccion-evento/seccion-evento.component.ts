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
  // keep raw items returned by server for filtering
  private allRawItems: any[] = [];
  // keep original raw items by id so we can open edit dialog with full data
  private rawMap: Record<string, any> = {};

  constructor(private eventoService: EventoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadEventos();
  }

  private loadEventos(): void {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || undefined;
    // New emprendedor endpoint is paginated; request first page with size 5
    this.eventoService.getEmprendedorEvents({ page: 0, size: 5, token }).subscribe({
      next: (res: any) => {
        // Support various paginated shapes: { content: [], data: [], result: [], items: [] }
        let items: any[] = [];
        if (Array.isArray(res)) items = res;
        else if (res?.content && Array.isArray(res.content)) items = res.content;
        else if (res?.data && Array.isArray(res.data)) items = res.data;
        else if (res?.result && Array.isArray(res.result)) items = res.result;
        else if (res?.items && Array.isArray(res.items)) items = res.items;

        this.rawMap = {};
        this.allRawItems = (items || []).slice();
        this.eventos = (this.allRawItems || []).map((it: any) => {
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

  // Client-side filtering so SearchBar can filter by name, date or type without changing shared component
  onSearch(payload: any) {
    console.log('SeccionEvento.onSearch payload:', payload);
    const q = String(payload?.query || '').toLowerCase().trim();
    const dateKey = payload?.date || payload?.fechaInicio || '';
    const typeKey = payload?.type || payload?.tipo || payload?.tipoEvento || '';

    const hasQ = q.length > 0;
    const hasDate = !!dateKey;
    const hasType = !!typeKey;

    const normalizeType = (raw: string) => {
      const s = String(raw || '').toLowerCase();
      if (!s) return '';
      if (s.includes('onl') || s.includes('vir')) return 'Online';
      if (s.includes('pres')) return 'Presencial';
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    const wantedType = normalizeType(typeKey);

    const filtered = (this.allRawItems || []).filter((it: any) => {
      // text search against titulo/nombre
      if (hasQ) {
        const title = String(it.titulo || it.nombre || '').toLowerCase();
        if (!title.includes(q)) return false;
      }

      // date filter: compare only date part YYYY-MM-DD
      if (hasDate) {
        const rawDate = it.fechaEvento || it.fecha || it.fechaEventoString || '';
        const d = String(rawDate || '');
        const datePart = d.includes('T') ? d.split('T')[0] : (d.includes('/') ? (() => {
          // try to convert dd/mm/yyyy to yyyy-mm-dd
          const parts = d.split('/');
          if (parts.length===3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          return d;
        })() : d);
        if (!datePart) return false;
        if (datePart !== String(dateKey)) return false;
      }

      // type filter: check tipoEvento, tipo or derive from lugar/direccion
      if (hasType) {
        const rawTipo = it.tipoEvento || it.tipo || '';
        const tipoNorm = normalizeType(rawTipo || it.direccion || it.lugar || '');
        if (!tipoNorm) return false;
        if (tipoNorm !== wantedType) return false;
      }

      return true;
    });

    // map to cards
    this.rawMap = {};
    this.eventos = (filtered || []).map((it: any) => {
      const card = this.mapToCard(it);
      this.rawMap[String(card.id)] = it;
      return card;
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
