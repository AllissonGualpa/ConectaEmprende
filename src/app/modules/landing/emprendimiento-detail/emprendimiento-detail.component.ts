import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { EmprendimientoService, EmprendimientoPublico } from '../../emprendimiento.service';

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
  textoCarga = 'Cargando emprendimiento...';

  // Modal
  modalAbierto = false;
  modalTitulo = '';
  modalContenido = '';

  constructor(
    private route: ActivatedRoute,
    private emprendimientoService: EmprendimientoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de emprendimiento no encontrado.';
      this.cargando = false;
      return;
    }

    this.determinarTipoDesdeURL();
    this.cargarEmprendimiento(+id);
  }

  determinarTipoDesdeURL(): void {
    if (typeof window === 'undefined') return;

    if (window.location.pathname.includes('/startups/')) {
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

        if (!this.esStartup && typeof window !== 'undefined') {
          const evaluacionUrl = `${window.location.origin}/evaluacion/${id}`;
          this.qrCodeUrl =
            `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evaluacionUrl)}`;
        }

        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar el emprendimiento.';
        this.cargando = false;
      }
    });
  }

  getDescripcionByType(tipo: string): string | null {
    if (!this.emprendimiento?.descripciones) return null;

    let descripcion = this.emprendimiento.descripciones.find(
      d => d.tipoDescripcion?.toUpperCase() === tipo.toUpperCase()
    );

    if (!descripcion && tipo.includes(' ')) {
      descripcion = this.emprendimiento.descripciones.find(
        d => d.tipoDescripcion?.toUpperCase() === tipo.replace(' ', '_').toUpperCase()
      );
    }

    if (!descripcion && tipo.includes('_')) {
      descripcion = this.emprendimiento.descripciones.find(
        d => d.tipoDescripcion?.toUpperCase() === tipo.replace('_', ' ').toUpperCase()
      );
    }

    return descripcion?.descripcion || null;
  }

  // Modal
  abrirModal(titulo: string, tipo: string) {
    const contenido = this.getDescripcionByType(tipo);
    if (!contenido) return;

    this.modalTitulo = titulo;
    this.modalContenido = contenido;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalTitulo = '';
    this.modalContenido = '';
  }
}
