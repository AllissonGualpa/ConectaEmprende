import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { EmprendimientoService } from '../../../emprendimiento.service';
import { CardsComponent } from '../../../../layout/cards/cards.component';
// importa tu componente de cards (ajusta la ruta y nombre si son distintos)

@Component({
  selector: 'app-seccion-emprendimiento',
  standalone: true,
  imports: [
    CommonModule,
    CardsComponent, // agregar componente de cards
  ],
  templateUrl: './seccion-emprendimiento.component.html',
  styleUrls: ['./seccion-emprendimiento.component.css']
})
export class SeccionEmprendimientoComponent implements OnInit {
  // Más adelante puedes inyectar servicios y manejar el listado real
  emprendimientos: any[] = [];

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
}
