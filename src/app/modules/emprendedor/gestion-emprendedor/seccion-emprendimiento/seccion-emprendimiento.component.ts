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
    CardsComponent,
    CreateSolicitudEmprendimientoComponent,
    EditSolicitudEmprendimientoComponent
  ],
  templateUrl: './seccion-emprendimiento.component.html',
  styleUrls: ['./seccion-emprendimiento.component.css']
})
export class SeccionEmprendimientoComponent implements OnInit {
  emprendimientos: any[] = [];
  cardsArray: CardItem[] = [];

  showCreateSolicitudModal = false;
  showEditSolicitudModal = false;
  selectedEditId: number | null = null;
  loading = false;

  constructor(private emprendimientoService: EmprendimientoService, private router: Router) {}

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
        this.cardsArray = this.emprendimientos.map((e) => ({
          id: e.id,
          title: e.nombreComercial || 'Emprendimiento sin nombre',
          description: `${e.nombreTipoEmprendimiento?.trim() || 'Tipo desconocido'} aprobado en ${e.nombreCiudad || 'sin ciudad'}`,
          image: e.multimedia && e.multimedia.length > 0 ? e.multimedia[0].urlArchivo :'/assets/img/inicio/foto5.png',
          category: e.nombreTipoEmprendimiento?.trim() || 'Emprendimiento',
          location: e.nombreCiudad || 'Sin ubicación',
          views: Math.floor(Math.random() * 20000) + 1000,
          status: this.mapEstado(e.estadoEmprendimiento),
          rawStatus: e.estadoEmprendimiento // CORREGIDO: ahora con 'S' mayúscula
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

  openEditSolicitudModal(item: CardItem): void {
    const estadosBloqueados = [
      'PENDIENTE_APROBACION',
      'RECHAZADO'
    ];

    if (item.rawStatus && estadosBloqueados.includes(item.rawStatus)) {
      alert('No puedes editar un emprendimiento en revisión o rechazado.');
      return;
    }

    this.selectedEditId = item.id;
    this.showEditSolicitudModal = true;
  }

  closeEditSolicitudModal(): void {
    this.selectedEditId = null;
    this.showEditSolicitudModal = false;
  }

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