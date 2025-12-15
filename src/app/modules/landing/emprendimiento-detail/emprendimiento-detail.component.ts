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
  qrCodeUrl = '';

  constructor(private route: ActivatedRoute, private emprendimientoService: EmprendimientoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarEmprendimiento(+id);
      // Generar URL de evaluación
      const evaluacionUrl = `${window.location.origin}/evaluacion/${id}`;
      // Generar QR usando API gratuita de Google Charts (o qr-server)
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evaluacionUrl)}`;
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

  isUrl(value?: string | null): boolean {
    return !!value && (value.startsWith('http://') || value.startsWith('https://'));
  }

  isPhone(value?: string | null): boolean {
    if (!value) return false;
    return /^\+?\d/.test(value.trim());
  }
}