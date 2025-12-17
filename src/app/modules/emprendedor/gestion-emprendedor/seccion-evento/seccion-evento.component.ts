// seccion-evento.component.ts (actualizado con paginación)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EventoService } from '../../../admin/evento.service';
import { MensajeConfirmacionComponent } from '../../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { DetailsEventoComponent } from '../details-evento/details-evento.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CardEventComponent, EventoCard } from '../../../../shared/components/card-event/card-event.component';

@Component({
  selector: 'app-seccion-evento',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SearchBarComponent, 
    CardEventComponent, 
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './seccion-evento.component.html',
  styleUrl: './seccion-evento.component.css'
})
export class SeccionEventoComponent implements OnInit {
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  estadoSeleccionado: string = '';

  eventos: any[] | null = null;
  eventosCards: EventoCard[] = [];
  eventosPaginados: EventoCard[] = [];
  private allRawItems: any[] = [];
  private rawMap: Record<string, any> = {};

  // Paginación
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

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
        this.dialog.open(MensajeConfirmacionComponent, { 
          width: '420px', 
          data: { subject: 'Evento' } 
        });
        this.loadEventos();
      }
    });
  }

  editarEventoFromCard(evento: EventoCard) {
    const raw = this.rawMap[String(evento.id)];
    if (!raw) {
      console.warn('No se encontró el raw item para editar', evento);
      return;
    }

    if (evento.estadoEvento.toLowerCase().includes('cancelado')) {
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

  cancelarEvento(evento: EventoCard) {
    if (evento.estadoEvento.toLowerCase().includes('cancelado')) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { 
        message: '¿Estás seguro que deseas cancelar este evento? Esta acción será irreversible.' 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const token = localStorage.getItem('token') || 
                      localStorage.getItem('accessToken') || 
                      localStorage.getItem('authToken') || 
                      undefined;
        
        this.eventoService.cancelEvent(evento.id!, { token }).subscribe({
          next: () => {
            this.loadEventos();
          },
          error: (err) => console.warn('Error cancelando evento:', err)
        });
      }
    });
  }

  private loadEventos(): void {
    this.eventos = null;

    const token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken') || 
                  undefined;
    
    this.eventoService.getEmprendedorEvents({ page: 0, size: 50, token }).subscribe({
      next: (res: any) => {
        let items: any[] = [];
        if (Array.isArray(res)) items = res;
        else if (res?.content && Array.isArray(res.content)) items = res.content;
        else if (res?.data && Array.isArray(res.data)) items = res.data;
        else if (res?.result && Array.isArray(res.result)) items = res.result;
        else if (res?.items && Array.isArray(res.items)) items = res.items;

        this.rawMap = {};
        this.allRawItems = (items || []).slice();
        this.eventosCards = this.allRawItems.map((it: any) => {
          const card = this.mapToEventoCard(it);
          this.rawMap[String(card.id)] = it;
          return card;
        });
        
        this.eventos = this.allRawItems;
        this.totalItems = this.eventosCards.length;
        this.updatePaginatedItems();
      },
      error: (err: any) => {
        console.warn('No se pudieron cargar eventos:', err);
        this.eventos = [];
        this.eventosCards = [];
        this.totalItems = 0;
        this.updatePaginatedItems();
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
        const datePart = d.includes('T') ? d.split('T')[0] : d;
        if (!datePart || datePart !== String(dateKey)) return false;
      }

      if (hasType) {
        const rawTipo = it.tipoEvento || it.tipo || '';
        const tipoNorm = normalizeType(rawTipo || it.direccion || it.lugar || '');
        if (!tipoNorm || tipoNorm !== wantedType) return false;
      }

      return true;
    });

    this.rawMap = {};
    this.eventosCards = filtered.map((it: any) => {
      const card = this.mapToEventoCard(it);
      this.rawMap[String(card.id)] = it;
      return card;
    });

    this.totalItems = this.eventosCards.length;
    this.pageIndex = 0;
    this.updatePaginatedItems();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedItems();
  }

  private updatePaginatedItems(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.eventosPaginados = this.eventosCards.slice(startIndex, endIndex);
  }

  private mapToEventoCard(it: any): EventoCard {
    return {
      id: it.idEvento ?? it.id ?? it._id ?? 0,
      titulo: it.titulo || it.nombre || 'Evento',
      descripcion: it.descripcion || '',
      fechaEvento: it.fechaEvento || it.fecha || new Date().toISOString(),
      horario: it.horario || it.hora || '',
      lugar: it.lugar || it.direccion || '',
      tipoEvento: it.tipoEvento || it.tipo || 'Presencial',
      estadoEvento: it.estadoEvento || it.status || 'Programado',
      urlMultimedia: it.urlMultimedia || it.imagen || '/assets/img/emprendimiento/foto1.png'
    };
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
}