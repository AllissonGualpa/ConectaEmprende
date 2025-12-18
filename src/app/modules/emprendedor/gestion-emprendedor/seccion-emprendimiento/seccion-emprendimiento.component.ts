import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { EmprendimientoService } from '../../../emprendimiento.service';
import { CardsComponent, CardItem } from '../../../../layout/cards/cards.component';
import { CreateSolicitudEmprendimientoComponent } from '../create-solicitud-emprendimiento/create-solicitud-emprendimiento.component';
import { EditSolicitudEmprendimientoComponent } from '../edit-solicitud-emprendimiento/edit-solicitud-emprendimiento.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seccion-emprendimiento',
  standalone: true,
  imports: [
    CommonModule,
    CardsComponent, // agregar componente de cards
    CreateSolicitudEmprendimientoComponent, // modal de creación
    EditSolicitudEmprendimientoComponent // componente de edición de Emprendimiento
  ],
  templateUrl: './seccion-emprendimiento.component.html',
  styleUrls: ['./seccion-emprendimiento.component.css']
})
export class SeccionEmprendimientoComponent implements OnInit {
  // Más adelante puedes inyectar servicios y manejar el listado real
  emprendimientos: any[] = [];
  cardsArray: CardItem[] = []; // <-- agregado para mapear a tarjetas

  // control del modal
  showCreateSolicitudModal = false;
  showEditSolicitudModal = false; // control del modal de edición
  selectedEditId: number | null = null; // id seleccionado para edición
  loading = false; // <-- loading agregado

  constructor(private emprendimientoService: EmprendimientoService,  private router: Router) {}

  ngOnInit(): void {
    this.loadEmprendimientos();
  }

  mapEstado(estado: string): string {
    switch (estado) {
      case 'APROBADO':
        return 'Aprobado';
      case 'PENDIENTE_APROBACION':
        return 'En revisión';
      case 'RECHAZADO':
        return 'Rechazado';
      case 'BORRADOR':
        return 'Borrador';
      default:
        return estado;
    }
  }

  loadEmprendimientos(): void {
    this.loading = true;
    this.emprendimientoService.getMisEmprendimientos().subscribe({
      next: (data) => {
        console.log('Emprendimientos cargados:', data);
        this.emprendimientos = data;
        // Mapear a formato de tarjetas, similar a emprendimientos.component.ts
        this.cardsArray = this.emprendimientos.map((e) => ({
          id: e.id,
          title: e.nombreComercial || 'Emprendimiento sin nombre',
          description: `${e.nombreTipoEmprendimiento?.trim() || 'Tipo desconocido'} aprobado en ${e.nombreCiudad || 'sin ciudad'}`,
          image: '/assets/img/inicio/foto5.png',
          category: e.nombreTipoEmprendimiento?.trim() || 'Emprendimiento',
          location: e.nombreCiudad || 'Sin ubicación',
          views: Math.floor(Math.random() * 20000) + 1000,
          status: this.mapEstado(e.estadoEmprendimiento)
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos', err);
        this.loading = false;
      }
    });
  }

  openCreateSolicitudModal(): void {
    this.showCreateSolicitudModal = true;
  }

  closeCreateSolicitudModal(): void {
    this.showCreateSolicitudModal = false;
  }

  // Abrir modal de edición pasando el CardItem o su id
  openEditSolicitudModal(itemOrId: any): void {
    // itemOrId puede ser el CardItem emitido por app-cards o solo un id
    const id = typeof itemOrId === 'number' ? itemOrId : itemOrId?.id;
    this.selectedEditId = id ?? null;
    this.showEditSolicitudModal = !!this.selectedEditId;
  }

  closeEditSolicitudModal(): void {
    this.selectedEditId = null;
    this.showEditSolicitudModal = false;
  }

  // Cuando se actualiza un emprendimiento en el modal de edición recargar lista
  onEmprendimientoUpdated(): void {
    this.closeEditSolicitudModal();
    this.loadEmprendimientos();
  }

  onEmprendimientoCreated(): void {
    this.closeCreateSolicitudModal();
    this.loadEmprendimientos();
  }
  onRoadmapClick(item: any) {
    
    this.router.navigate(['emprendedor/roadmap', item.id]);
    
  }
}
