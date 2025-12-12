import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EmprendimientoDto,
  EmprendimientoCategoriaDto,
  DescripcionDto,
  MetricaDto,
  PresenciaDigitalDto,
  ParticipacionComunidadDto,
  DeclaracionFinalDto,
  SolicitudEmprendimientoDto,
  SolicitudEmprendimientoDataDto,
} from './create-solicitud-emprendimiento.interfaces';
import { EmprendimientoService } from '../../../emprendimiento.service';

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

  loading = false;

  constructor(private emprendimientoService: EmprendimientoService) {}

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

  // Helper: quita tildes y pasa a minúsculas
  private normalizeText(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
      .toLocaleUpperCase();
  }

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
    if (!this.isMultimediaComplete || !this.isMetricasComplete || !this.isDeclaracionesComplete) {
      return;
    }

    const nowIso = new Date().toISOString();

    const emprendimientoBase: EmprendimientoDto = {
      id: 0,
      correoComercial: this.normalizeText(this.presenciaDigital.instagram),
      correoUees: '',
      identificacion: '',
      parienteDirecto: '',
      nombreComercialEmprendimiento: this.normalizeText(this.descripcion.resumen),
      fechaCreacion: nowIso,
      ciudad: 0,
      provinia: 0,
      estadoEmpredimiento: true,
      tipoEmprendimiento: '',
      tipoEmprendimientoId: 0,
      datosPublicos: this.presenciaDigital.aceptaMostrarPublicamente,
    };

    const categoriasSeleccionadas: EmprendimientoCategoriaDto[] = this.categories
      .filter(c => c.selected)
      .map((c, index) => ({
        emprendimiento: emprendimientoBase,
        categoria: {
          id: index + 1,
          nombre: this.normalizeText(c.label),
          descripcion: '',
          urlImagen: '',
          idMultimedia: 0,
        },
        nombreCategoria: this.normalizeText(c.label),
      }));

    const descripciones: DescripcionDto[] = [
      {
        tipoDescripcion: this.normalizeText('Resumen'),
        descripcion: this.descripcion.resumen,
        maxCaracteres: 500,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('Diferencial'),
        descripcion: this.descripcion.diferencial,
        maxCaracteres: 1000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('Público objetivo'),
        descripcion: this.descripcion.publicoObjetivo,
        maxCaracteres: 1000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('Propósito'),
        descripcion: this.descripcion.proposito,
        maxCaracteres: 1000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('Historia'),
        descripcion: this.historia.historiaGeneral,
        maxCaracteres: 2000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
    ];

    const metricas: MetricaDto[] = [
      {
        emprendimientoId: 0,
        metricaId: 1,
        valor: this.normalizeText(this.metricas.clientes),
      },
      {
        emprendimientoId: 0,
        metricaId: 2,
        valor: this.normalizeText(this.metricas.haGeneradoVentas ? 'SI' : 'NO'),
      },
      {
        emprendimientoId: 0,
        metricaId: 3,
        valor: this.normalizeText(
          this.metricas.haParticipadoIncubacion
            ? (this.metricas.nombreProgramaIncubacion || 'SI')
            : 'NO'
        ),
      },
    ];

    const presenciasDigitales: PresenciaDigitalDto[] = [
      {
        emprendimientoId: 0,
        plataforma: 'instagram',
        descripcion: this.normalizeText(this.presenciaDigital.instagram),
      },
      {
        emprendimientoId: 0,
        plataforma: 'sitio web',
        descripcion: this.normalizeText(this.presenciaDigital.sitioWeb),
      },
      {
        emprendimientoId: 0,
        plataforma: 'whatsapp',
        descripcion: this.normalizeText(this.presenciaDigital.whatsapp),
      },
      {
        emprendimientoId: 0,
        plataforma: 'tiktok',
        descripcion: this.normalizeText(this.presenciaDigital.tiktok),
      },
    ];

    const participacionesComunidad: ParticipacionComunidadDto[] = [
      {
        emprendimientoId: 0,
        opcionParticipacionId: 1,
        respuesta: !!this.participacion.interesRankings,
        nombreOpcionParticipacion: this.normalizeText('Rankings'),
      },
      {
        emprendimientoId: 0,
        opcionParticipacionId: 2,
        respuesta: !!this.participacion.publicacionesMensuales,
        nombreOpcionParticipacion: this.normalizeText('PublicacionesMensuales'),
      },
      {
        emprendimientoId: 0,
        opcionParticipacionId: 3,
        respuesta: !!this.participacion.recibirFeedback,
        nombreOpcionParticipacion: this.normalizeText('Feedback'),
      },
    ];

    const declaracionesFinales: DeclaracionFinalDto[] = [
      {
        emprendimientoId: 0,
        declaracionId: 1,
        aceptada: this.declaraciones.infoVeridica,
        fechaAceptacion: nowIso,
        nombreFirma: '',
      },
      {
        emprendimientoId: 0,
        declaracionId: 2,
        aceptada: this.declaraciones.aceptaPublicacion,
        fechaAceptacion: nowIso,
        nombreFirma: '',
      },
      {
        emprendimientoId: 0,
        declaracionId: 3,
        aceptada: this.declaraciones.autorizaUsoImagenes,
        fechaAceptacion: nowIso,
        nombreFirma: '',
      },
      {
        emprendimientoId: 0,
        declaracionId: 4,
        aceptada: this.declaraciones.aceptaPoliticasCentro,
        fechaAceptacion: nowIso,
        nombreFirma: '',
      },
    ];

    const imagenes: string[] = [
      this.multimedia.logo ? this.normalizeText('logo.png') : '',
      ...this.multimedia.fotosProductos.map((_, i) =>
        this.normalizeText(`fotoProducto_${i + 1}.png`)
      ),
      this.multimedia.banner ? this.normalizeText('banner.png') : '',
      this.multimedia.videoPresentacion ? this.normalizeText('video.mp4') : '',
    ].filter(x => !!x);

    const tiposMultimedia: string[] = [
      this.multimedia.logo ? this.normalizeText('logo') : '',
      this.multimedia.fotosProductos.length ? this.normalizeText('fotosProductos') : '',
      this.multimedia.banner ? this.normalizeText('banner') : '',
      this.multimedia.videoPresentacion ? this.normalizeText('video') : '',
    ].filter(x => !!x);

    const data: SolicitudEmprendimientoDataDto = {
      usuarioId: 0, // TODO: reemplazar con el id real del usuario autenticado
      emprendimiento: emprendimientoBase,
      tipoAccion: this.normalizeText('CREAR'),
      categorias: categoriasSeleccionadas,
      descripciones,
      metricas,
      presenciasDigitales,
      participacionesComunidad,
      declaracionesFinales,
      imagenes,
      tiposMultimedia,
    };

    // Construir arreglo de archivos para multipart/form-data
    const files: File[] = [];
    if (this.multimedia.logo) {
      files.push(this.multimedia.logo);
    }
    if (this.multimedia.banner) {
      files.push(this.multimedia.banner);
    }
    if (this.multimedia.videoPresentacion) {
      files.push(this.multimedia.videoPresentacion);
    }
    if (this.multimedia.fotosProductos.length) {
      files.push(...this.multimedia.fotosProductos);
    }

    this.loading = true;
    this.emprendimientoService.grabarEmprendimiento(data, files).subscribe({
      next: (resp) => {
        console.log('Emprendimiento grabado correctamente', resp);
        this.loading = false;
        // aquí podrías emitir un evento al padre para cerrar el modal o refrescar la lista
      },
      error: (err) => {
        console.error('Error al grabar emprendimiento', err);
        this.loading = false;
      },
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
