import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { EmprendimientoService, EmprendimientoPublico } from '../../emprendimiento.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-emprendimiento-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './emprendimiento-detail.component.html',
  styleUrls: ['./emprendimiento-detail.component.css']
})
export class EmprendimientoDetailComponent implements OnInit {
  emprendimiento: EmprendimientoPublico | null = null;
  cargando = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private emprendimientoService: EmprendimientoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarEmprendimiento(+id);
    } else {
      this.error = 'ID de emprendimiento no encontrado.';
      this.cargando = false;
    }
  }

  cargarEmprendimiento(id: number): void {
    this.emprendimientoService.getEmprendimientoPublico(id).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el emprendimiento.';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  // Helper para el template: detectar URL (comienza con http/https)
  isUrl(value?: string | null): boolean {
    return !!value && (value.startsWith('http://') || value.startsWith('https://'));
  }

  // Helper para el template: detectar si es número/telefónico (empieza con dígito o +)
  isPhone(value?: string | null): boolean {
    if (!value) return false;
    return /^\+?\d/.test(value.trim());
  }
}
