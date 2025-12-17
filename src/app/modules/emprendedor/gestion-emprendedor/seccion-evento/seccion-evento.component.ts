import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CardsComponent, CardItem } from '../../../../layout/cards/cards.component';
import { EventoService } from '../../../admin/evento.service';
import { MensajeConfirmacionComponent } from '../../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { DetailsEventoComponent } from '../details-evento/details-evento.component';

@Component({
  selector: 'app-seccion-evento',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBarComponent, CardsComponent, MatDialogModule],
  templateUrl: './seccion-evento.component.html',
  styleUrl: './seccion-evento.component.css'
})
export class SeccionEventoComponent implements OnInit {
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  estadoSeleccionado: string = '';

  eventos: CardItem[] | null = null;
  private allRawItems: any[] = [];
  private rawMap: Record<string, any> = {};

  constructor(private eventoService: EventoService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadEventos();
  }

  abrirCrear() {
    const ref = this.dialog.open(DetailsEventoComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        this.dialog.open(MensajeConfirmacionComponent, { width: '420px', data: { subject: 'Evento' } });
        this.loadEventos();
      }
    });
  }

  editarEvento(item: CardItem) {
    const raw = this.rawMap[String(item.id)];
    if (!raw) {
      console.warn('No se encontró el raw item para editar', item);
      return;
    }

    const ref = this.dialog.open(DetailsEventoComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'edit', evento: raw }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result) {
        const newTitle = result.titulo || result.nombre || '';
        this.dialog.open(MensajeConfirmacionComponent, {
          width: '420px',
          data: { title: 'Evento editado exitosamente', subtitle: newTitle }
        });
        this.loadEventos();
      }
    });
  }

  eliminarEvento(item: CardItem) {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || undefined;
    this.eventoService.inactivateEvent(item.id, { token }).subscribe({
      next: () => {
        this.loadEventos();
      },
      error: (err) => console.warn('Error inactivando desde seccion-evento', err)
    });
  }

  private loadEventos(): void {
    this.eventos = null;

    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || undefined;
    this.eventoService.getEmprendedorEvents({ page: 0, size: 5, token }).subscribe({
      next: (res: any) => {
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

  onSearch(payload: any) {
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
      if (hasQ) {
        const title = String(it.titulo || it.nombre || '').toLowerCase();
        if (!title.includes(q)) return false;
      }

      if (hasDate) {
        const rawDate = it.fechaEvento || it.fecha || it.fechaEventoString || '';
        const d = String(rawDate || '');
        const datePart = d.includes('T') ? d.split('T')[0] : (d.includes('/') ? (() => {
          const parts = d.split('/');
          if (parts.length===3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
          return d;
        })() : d);
        if (!datePart) return false;
        if (datePart !== String(dateKey)) return false;
      }

      if (hasType) {
        const rawTipo = it.tipoEvento || it.tipo || '';
        const tipoNorm = normalizeType(rawTipo || it.direccion || it.lugar || '');
        if (!tipoNorm) return false;
        if (tipoNorm !== wantedType) return false;
      }

      return true;
    });

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

  consultar() {
    const payload = {
      query: '',
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      estado: this.estadoSeleccionado
    };
    this.onSearch(payload);
  }

  onDiscover(item: CardItem) {
    console.log('Discover', item);
  }

  onRegister(item: CardItem) {
    console.log('Register', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Toggle favorite', item);
  }
}