import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { EmprendimientoService } from '../../../emprendimiento.service';
import { CardsComponent } from '../../../../layout/cards/cards.component';
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

  // control del modal
  showCreateSolicitudModal = false;

  constructor(private emprendimientoService: EmprendimientoService) {}

  ngOnInit(): void {
    this.emprendimientoService.getMisEmprendimientos().subscribe({
      next: (data) => {
        this.emprendimientos = data;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos', err);
      }
    });
  }

  openCreateSolicitudModal(): void {
    this.showCreateSolicitudModal = true;
  }

  closeCreateSolicitudModal(): void {
    this.showCreateSolicitudModal = false;
  }
}
