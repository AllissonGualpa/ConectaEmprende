import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { EmprendimientoPublico } from '../../../core/types/emprendimiento.types';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
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
    this.emprendimientoService.obtenerEmprendimientoPublico(id).subscribe({
      next: (data) => {
        this.emprendimiento = data;

        const tipo = data?.nombreTipoEmprendimiento?.toLowerCase() || '';
        this.esStartup = tipo.includes('startup');

        // Generar QR solo para emprendimientos (no startups)
        if (!this.esStartup) {
          const host = 'http://localhost:8080'; // Cambio aquí
          const evaluacionUrl = `${host}/valoracion/${id}`;

          this.qrCodeUrl =
            `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evaluacionUrl)}`;
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = 'Error al cargar el emprendimiento.';
        this.cargando = false;
      }
    });
  }

  getDescripcionByBase(descripcionBase: string): string | null {
    if (!this.emprendimiento?.descripciones) return null;

    const descripcion = this.emprendimiento.descripciones.find(
      d => d.descripcionBase?.toLowerCase() === descripcionBase.toLowerCase()
    );

    return descripcion?.respuesta || null;
  }

  // Métodos helpers para obtener descripciones específicas
  getQueOfrece(): string | null {
    return this.getDescripcionByBase('¿Qué ofrece?');
  }

  getHistoria(): string | null {
    return this.getDescripcionByBase('Historia del emprendimiento');
  }

  getQueLoHaceDiferente(): string | null {
    return this.getDescripcionByBase('¿Qué lo hace diferente o innovador?');
  }

  getPublicoObjetivo(): string | null {
    return this.getDescripcionByBase('¿A qué público objetivo te diriges?');
  }

  getProposito(): string | null {
    return this.getDescripcionByBase('¿Cuál es tu propósito o misión como emprendedor/a?');
  }

  // Modal - Versión actualizada
  abrirModal(titulo: string, descripcionBase: string) {
    const contenido = this.getDescripcionByBase(descripcionBase);
    if (!contenido) {
      console.warn(`No se encontró descripción para: ${descripcionBase}`);
      return;
    }

    this.modalTitulo = titulo;
    this.modalContenido = contenido;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalTitulo = '';
    this.modalContenido = '';
  }

  // Métodos útiles para el template
  getLogo(): string | null {
    if (!this.emprendimiento?.multimedia) return null;
    
    const logo = this.emprendimiento.multimedia.find(
      m => m.nombreActivo?.toUpperCase().includes('LOGO')
    );
    
    return logo?.urlArchivo || null;
  }

  getFotosProducto(): string[] {
    if (!this.emprendimiento?.multimedia) return [];
    
    return this.emprendimiento.multimedia
      .filter(m => m.nombreActivo?.toUpperCase().includes('FOTOPRODUCTO'))
      .map(m => m.urlArchivo);
  }

  getPresenciaDigital(plataforma: string): string | null {
    if (!this.emprendimiento?.presenciasDigitales) return null;
    
    const presencia = this.emprendimiento.presenciasDigitales.find(
      p => p.plataforma?.toLowerCase() === plataforma.toLowerCase()
    );
    
    return presencia?.descripcion || null;
  }

  // Método para obtener el link de WhatsApp formateado
  getWhatsAppLink(numero: string): string {
    const numeroLimpio = numero.replace(/[^0-9]/g, '');
    return `https://wa.me/${numeroLimpio}`;
  }
}