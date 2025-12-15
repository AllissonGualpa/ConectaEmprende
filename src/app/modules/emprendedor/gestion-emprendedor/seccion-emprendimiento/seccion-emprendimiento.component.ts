import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { EmprendimientoService } from '../../../emprendimiento.service';
import { CardsComponent, CardItem } from '../../../../layout/cards/cards.component';
import { CreateSolicitudEmprendimientoComponent } from '../create-solicitud-emprendimiento/create-solicitud-emprendimiento.component';

@Component({
  selector: 'app-seccion-emprendimiento',
  standalone: true,
  imports: [
    CommonModule,
    CardsComponent, // agregar componente de cards
    CreateSolicitudEmprendimientoComponent, // modal de creación
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
  loading = false; // <-- loading agregado

  constructor(private emprendimientoService: EmprendimientoService) {}

  ngOnInit(): void {
    this.loadEmprendimientos();
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

  onEmprendimientoCreated(): void {
    this.closeCreateSolicitudModal();
    this.loadEmprendimientos();
  }
}
