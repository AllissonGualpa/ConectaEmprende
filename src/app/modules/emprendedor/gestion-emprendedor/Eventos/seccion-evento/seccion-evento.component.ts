import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetailsEventoComponent } from '../details-evento/details-evento.component';
import { CardEventComponent, EventoCard } from '../../../../../shared/components/card-event/card-event.component';
import { EventoService } from '../../../../../core/services/evento.service';
import { MensajeConfirmacionComponent } from '../../../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-seccion-evento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardEventComponent,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './seccion-evento.component.html',
  styleUrl: './seccion-evento.component.css'
})
export class SeccionEventoComponent implements OnInit {
  filtrosForm: FormGroup;
  
  eventos: any[] | null = null;
  eventosCards: EventoCard[] = [];
  eventosPaginados: EventoCard[] = [];
  private allRawItems: any[] = [];
  private rawMap: Record<string, any> = {};

  // Paginación
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  // Opciones de filtros
  estadosOptions = [
    { value: 'programado', label: 'Programado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'terminado', label: 'Terminado' }
  ];

  tiposOptions = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' }
  ];

  constructor(
    private eventoService: EventoService, 
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      nombre: [''],
      fechaInicio: [null],
      fechaFin: [null],
      estado: [''],
      tipoEvento: ['']
    });
  }

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

    const estadoLower = evento.estadoEvento.toLowerCase();
    
    // Bloquear edición si está cancelado o terminado
    if (estadoLower.includes('cancelado') || estadoLower.includes('terminado')) {
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
    const estadoLower = evento.estadoEvento.toLowerCase();
    
    // Bloquear cancelación si ya está cancelado o terminado
    if (estadoLower.includes('cancelado') || estadoLower.includes('terminado')) {
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
  aplicarFiltros() {
    const filtros = this.filtrosForm.value;
    
    const filtered = (this.allRawItems || []).filter((it: any) => {
      // Filtro por nombre
      if (filtros.nombre) {
        const titulo = String(it.titulo || it.nombre || '').toLowerCase();
        if (!titulo.includes(filtros.nombre.toLowerCase())) return false;
      }

      // Filtro por fecha inicio
      if (filtros.fechaInicio) {
        const fechaEvento = new Date(it.fechaEvento || it.fecha);
        const fechaInicio = new Date(filtros.fechaInicio);
        if (fechaEvento < fechaInicio) return false;
      }

      // Filtro por fecha fin
      if (filtros.fechaFin) {
        const fechaEvento = new Date(it.fechaEvento || it.fecha);
        const fechaFin = new Date(filtros.fechaFin);
        if (fechaEvento > fechaFin) return false;
      }

      // Filtro por estado
      if (filtros.estado) {
        const estado = (it.estadoEvento || it.estado || '').toLowerCase();
        if (estado !== filtros.estado.toLowerCase()) return false;
      }

      // Filtro por tipo evento
      if (filtros.tipoEvento) {
        const tipo = (it.tipoEvento || it.tipo || '').toLowerCase();
        if (tipo !== filtros.tipoEvento.toLowerCase()) return false;
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

  limpiarFiltros() {
    this.filtrosForm.reset({
      nombre: '',
      fechaInicio: null,
      fechaFin: null,
      estado: '',
      tipoEvento: ''
    });
    
    this.rawMap = {};
    this.eventosCards = this.allRawItems.map((it: any) => {
      const card = this.mapToEventoCard(it);
      this.rawMap[String(card.id)] = it;
      return card;
    });

    this.totalItems = this.eventosCards.length;
    this.pageIndex = 0;
    this.updatePaginatedItems();
  }

  private loadEventos(): void {
    this.eventos = null;

    const token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('authToken') || 
                  undefined;
    
    this.eventoService.getEmprendedorEvents({ page: 0, size: 100, token }).subscribe({
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
      tipoEvento: it.tipoEvento || it.tipo || 'presencial',
      estadoEvento: it.estadoEvento || it.estado || 'programado',
      urlMultimedia: it.urlMultimedia || it.imagen || '/assets/img/emprendimiento/foto1.png'
    };
  }
}