import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-solicitud-emprendimiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // necesario para usar [(ngModel)]
  ],
  templateUrl: './create-solicitud-emprendimiento.component.html',
  styleUrls: ['./create-solicitud-emprendimiento.component.css'],
})
export class CreateSolicitudEmprendimientoComponent {
  currentStep = 0;

  steps = [
    { title: 'Categorías del emprendimiento', description: 'Selecciona el rubro que mejor represente tu emprendimiento (puedes escoger hasta 2).' },
    { title: 'Descripción del emprendimiento', description: 'Cuéntanos más sobre tu emprendimiento, qué lo hace único y a quién va dirigido.' },
    { title: 'Historia y presencia digital', description: 'Comparte la historia de tu emprendimiento y cómo las personas pueden encontrarte.' },
    { title: 'Material multimedia', description: 'Adjunta logo, fotos, video y banner para completar tu perfil.' },
    { title: 'Métricas y participación', description: 'Dinos cómo va tu emprendimiento y cómo quieres participar en la comunidad.' },
    { title: 'Declaraciones finales', description: 'Confirma las declaraciones necesarias para enviar tu solicitud.' },
  ];

  categories = [
    'Alimentos y bebidas',
    'Moda y accesorios',
    'Salud y bienestar',
    'Educación y formación',
    'Tecnología y software',
    'Arte y cultura',
    'Servicios profesionales',
    'Sustentabilidad y medio ambiente',
    'Otro',
  ].map(label => ({ label, selected: false }));

  // Modelo de la descripción del emprendimiento (paso 2)
  descripcion = {
    resumen: '',
    diferencial: '',
    publicoObjetivo: '',
    proposito: '',
  };

  // Modelo de la historia del emprendimiento (paso 3)
  historia = {
    historiaGeneral: '',
  };

  presenciaDigital = {
    instagram: '',
    sitioWeb: '',
    whatsapp: '',
    tiktok: '',
    aceptaMostrarPublicamente: true,
  };

  // Modelo de métricas y participación (paso 4)
  metricas = {
    clientes: '',                // '1-10' | '11-50' | '51-100' | '100+'
    haGeneradoVentas: null as boolean | null,
    haParticipadoIncubacion: null as boolean | null,
    nombreProgramaIncubacion: '',
  };

  participacion = {
    interesRankings: null as boolean | null,
    publicacionesMensuales: null as boolean | null,
    recibirFeedback: null as boolean | null,
  };

  // Modelo de archivos para el paso 3 (material multimedia)
  multimedia = {
    logo: null as File | null,
    logoPreview: '' as string,

    fotosProductos: [] as File[],
    fotosProductosPreview: [] as string[],

    videoPresentacion: null as File | null,
    videoPreview: '' as string,

    banner: null as File | null,
    bannerPreview: '' as string,
  };

  // Declaraciones finales (nuevo paso 5)
  declaraciones = {
    infoVeridica: false,
    aceptaPublicacion: false,
    autorizaUsoImagenes: false,
    aceptaPoliticasCentro: false,
  };

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  get selectedCategoriesCount(): number {
    return this.categories.filter(c => c.selected).length;
  }

  get canGoNextFromStep1(): boolean {
    return this.selectedCategoriesCount > 0 && this.selectedCategoriesCount <= 2;
  }

  // todos los textareas del paso 2 deben tener contenido (no solo espacios)
  get isDescripcionComplete(): boolean {
    const { resumen, diferencial, publicoObjetivo, proposito } = this.descripcion;
    return (
      resumen.trim().length > 0 &&
      diferencial.trim().length > 0 &&
      publicoObjetivo.trim().length > 0 &&
      proposito.trim().length > 0
    );
  }

  // historia no puede ir vacía
  get isHistoriaComplete(): boolean {
    return this.historia.historiaGeneral.trim().length > 0;
  }

  // todos los inputs de presencia digital deben tener contenido (no solo espacios)
  get isPresenciaDigitalComplete(): boolean {
    const { instagram, sitioWeb, whatsapp, tiktok } = this.presenciaDigital;
    return (
      instagram.trim().length > 0 &&
      sitioWeb.trim().length > 0 &&
      whatsapp.trim().length > 0 &&
      tiktok.trim().length > 0
    );
  }

  // Paso 3 (ahora índice 3): multimedia
  get isMultimediaComplete(): boolean {
    const fotosCount = this.multimedia.fotosProductos.length;
    return !!this.multimedia.logo &&
      fotosCount > 0 &&
      fotosCount < 3 &&
      !!this.multimedia.videoPresentacion &&
      !!this.multimedia.banner;
  }

  // Paso 4 (ahora índice 4): métricas y participación
  get isMetricasComplete(): boolean {
    const m = this.metricas;
    const p = this.participacion;

    const metricasOk =
      !!m.clientes &&
      m.haGeneradoVentas !== null &&
      m.haParticipadoIncubacion !== null &&
      (!m.haParticipadoIncubacion || m.nombreProgramaIncubacion.trim().length > 0);

    const participacionOk =
      p.interesRankings !== null &&
      p.publicacionesMensuales !== null &&
      p.recibirFeedback !== null;

    return metricasOk && participacionOk;
  }

  // Declaraciones: todas deben estar marcadas
  get isDeclaracionesComplete(): boolean {
    const d = this.declaraciones;
    return d.infoVeridica &&
      d.aceptaPublicacion &&
      d.autorizaUsoImagenes &&
      d.aceptaPoliticasCentro;
  }

  toggleCategory(cat: { label: string; selected: boolean }): void {
    if (!cat.selected && this.selectedCategoriesCount >= 2) {
      return;
    }
    cat.selected = !cat.selected;
  }

  nextStep(): void {
    if (this.currentStep === 0 && !this.canGoNextFromStep1) return;
    if (this.currentStep === 1 && !this.isDescripcionComplete) return;
    if (this.currentStep === 2 && (!this.isHistoriaComplete || !this.isPresenciaDigitalComplete)) return;
    if (this.currentStep === 3 && !this.isMultimediaComplete) return;
    if (this.currentStep === 4 && !this.isMetricasComplete) return;

    if (!this.isLastStep) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (!this.isFirstStep) {
      this.currentStep--;
    }
  }

  finish(): void {
    // Validar multimedia, métricas y declaraciones
    if (!this.isMultimediaComplete || !this.isMetricasComplete || !this.isDeclaracionesComplete) {
      return;
    }

    console.log('Enviar solicitud de creación de emprendimiento (en construcción)', {
      categorias: this.categories.filter(c => c.selected).map(c => c.label),
      descripcion: this.descripcion,
      historia: this.historia,
      presenciaDigital: this.presenciaDigital,
      multimedia: {
        logo: this.multimedia.logo,
        fotosProductos: this.multimedia.fotosProductos,
        videoPresentacion: this.multimedia.videoPresentacion,
        banner: this.multimedia.banner,
      },
      metricas: this.metricas,
      participacion: this.participacion,
      declaraciones: this.declaraciones,
    });
  }

  // Manejo de carga de archivos
  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.multimedia.logo = file;
    this.multimedia.logoPreview = URL.createObjectURL(file);
    input.value = '';
  }

  onFotosProductosChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    // máximo 2 fotos en total
    const remainingSlots = 2 - this.multimedia.fotosProductos.length;
    if (remainingSlots <= 0) {
      input.value = '';
      return;
    }

    const toAdd = files.slice(0, remainingSlots);

    toAdd.forEach(file => {
      this.multimedia.fotosProductos.push(file);
      this.multimedia.fotosProductosPreview.push(URL.createObjectURL(file));
    });

    input.value = '';
  }

  removeFotoProducto(index: number): void {
    this.multimedia.fotosProductos.splice(index, 1);
    this.multimedia.fotosProductosPreview.splice(index, 1);
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.multimedia.videoPresentacion = file;
    this.multimedia.videoPreview = URL.createObjectURL(file);
    input.value = '';
  }

  onBannerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.multimedia.banner = file;
    this.multimedia.bannerPreview = URL.createObjectURL(file);
    input.value = '';
  }

  removeLogo(): void {
    this.multimedia.logo = null;
    this.multimedia.logoPreview = '';
  }

  removeVideo(): void {
    this.multimedia.videoPresentacion = null;
    this.multimedia.videoPreview = '';
  }

  removeBanner(): void {
    this.multimedia.banner = null;
    this.multimedia.bannerPreview = '';
  }
}
