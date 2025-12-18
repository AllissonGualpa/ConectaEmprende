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
})
export class EmprendimientoDetailComponent implements OnInit {
  emprendimiento: EmprendimientoPublico | null = null;
  cargando = true;
  error: string | null = null;
  qrCodeUrl = '';
  esStartup = false;
  textoCarga = 'Cargando emprendimiento...'; // Texto por defecto

  constructor(private route: ActivatedRoute, private emprendimientoService: EmprendimientoService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Verificar si viene de la página de startups (podrías usar el referer o un parámetro)
      this.determinarTipoDesdeURL();
      this.cargarEmprendimiento(+id);
    } else {
      this.error = 'ID de emprendimiento no encontrado.';
      this.cargando = false;
    }
  }

  determinarTipoDesdeURL(): void {
    if (typeof window === 'undefined') return; // evita usar window en servidor

    const urlCompleta = window.location.pathname;
    if (urlCompleta.includes('/startups/')) {
      this.esStartup = true;
      this.textoCarga = 'Cargando startup...';
    }
  }

  cargarEmprendimiento(id: number): void {
    this.emprendimientoService.getEmprendimientoPublico(id).subscribe({
      next: (data) => {
        this.emprendimiento = data;

        const tipo = data?.nombreTipoEmprendimiento?.toLowerCase() || '';
        this.esStartup = tipo.includes('startup');

        if (this.esStartup) {
          this.textoCarga = 'Cargando startup...';
        }

        if (!this.esStartup && typeof window !== 'undefined') {
          const evaluacionUrl = `${window.location.origin}/evaluacion/${id}`;
          this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evaluacionUrl)}`;
        } else {
          this.qrCodeUrl = '';
        }

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
  // Agrega este método en tu componente TypeScript
  getDescripcionByType(tipo: string): string | null {
    if (!this.emprendimiento?.descripciones) return null;

    // Buscar coincidencia exacta
    let descripcion = this.emprendimiento.descripciones.find(
      d => d.tipoDescripcion?.toUpperCase() === tipo.toUpperCase()
    );

    // Si no encuentra, intentar con variaciones
    if (!descripcion && tipo.includes(' ')) {
      const tipoConGuion = tipo.replace(' ', '_');
      descripcion = this.emprendimiento.descripciones.find(
        d => d.tipoDescripcion?.toUpperCase() === tipoConGuion.toUpperCase()
      );
    }

    // Si no encuentra, intentar con guión cambiado por espacio
    if (!descripcion && tipo.includes('_')) {
      const tipoConEspacio = tipo.replace('_', ' ');
      descripcion = this.emprendimiento.descripciones.find(
        d => d.tipoDescripcion?.toUpperCase() === tipoConEspacio.toUpperCase()
      );
    }

    return descripcion?.descripcion || null;
  }
}
