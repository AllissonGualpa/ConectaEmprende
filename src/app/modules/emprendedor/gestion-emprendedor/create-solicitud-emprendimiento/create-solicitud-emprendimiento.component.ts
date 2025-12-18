import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  SolicitudEmprendimientoDataDto,
} from './create-solicitud-emprendimiento.interfaces';
import { EmprendimientoCrearResponse, EmprendimientoService, TipoEmprendimiento } from '../../../emprendimiento.service';
import { CiudadDto, LocationService, ProvinciaDto } from '../../../../core/services/location.service';
import { AuthService } from '../../../auth/auth.service';
import { CategoriaService } from '../../../admin/categoria.service';
import { Categoria } from '../../../../models/categoria.interface';

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
export class CreateSolicitudEmprendimientoComponent implements OnInit {
    // Tipo de emprendimiento seleccionado en la sección correspondiente
    tipoEmprendimiento: number = 0;
    tiposEmprendimiento: TipoEmprendimiento[] = [];
  // --- UBICACIÓN ---
  ubicacion = {
    provincia: '',
    ciudad: ''
  };
  provincias: ProvinciaDto[] = [];
  ciudadesFiltradas: { id: number; nombre: string }[] = [];

  @Output() onEmprendimientoCreated = new EventEmitter<void>();

  // Nuevo output para notificar al padre que la creación fue exitosa
  @Output() created = new EventEmitter<any>();

  // Reemplazamos la lista quemada por un array que guarda id, label y selected
  categories: { id: number; label: string; selected: boolean }[] = [];

  constructor(
    private emprendimientoService: EmprendimientoService,
    private locationService: LocationService,
    private authService: AuthService,
    private categoriaService: CategoriaService, // nuevo
  ) {}

  ngOnInit(): void {
    // Cargar provincias desde la API
    this.locationService.getProvincias().subscribe({
      next: (provincias: ProvinciaDto[]) => {
        this.provincias = provincias;
      },
      error: () => {
        this.provincias = [];
      }
    });

    // Cargar tipos de emprendimiento
    this.emprendimientoService.getTiposEmprendimiento().subscribe({
      next: (tipos: TipoEmprendimiento[]) => {
        this.tiposEmprendimiento = tipos;
      },
      error: () => {
        this.tiposEmprendimiento = [];
      }
    });

    // Cargar categorías desde la API
    this.categoriaService.getCategorias().subscribe({
      next: (cats: Categoria[]) => {
        this.categories = cats.map(c => ({ id: c.id, label: c.nombre, selected: false }));
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  onProvinciaChange() {
    this.ubicacion.ciudad = '';
    if (!this.ubicacion.provincia) {
      this.ciudadesFiltradas = [];
      return;
    }
    this.locationService.getCiudadesPorProvincia(Number(this.ubicacion.provincia)).subscribe({
      next: (ciudades: CiudadDto[]) => {
        this.ciudadesFiltradas = ciudades.map((c) => ({
          id: c.id,
          nombre: c.nombreCiudad,
        }));
      },
      error: () => {
        this.ciudadesFiltradas = [];
      },
    });
  }
  currentStep = 0;

  loading = false;

  steps = [
    { title: 'Descripción del emprendimiento', description: 'Cuéntanos más sobre tu emprendimiento, qué lo hace único y a quién va dirigido.' },
    { title: 'Categorías del emprendimiento', description: 'Selecciona el rubro que mejor represente tu emprendimiento (puedes escoger hasta 2).' },
    { title: 'Historia y presencia digital', description: 'Comparte la historia de tu emprendimiento y cómo las personas pueden encontrarte.' },
    { title: 'Material multimedia', description: 'Adjunta logo, fotos, video y banner para completar tu perfil.' },
    { title: 'Métricas y participación', description: 'Dinos cómo va tu emprendimiento y cómo quieres participar en la comunidad.' },
    { title: 'Declaraciones finales', description: 'Confirma las declaraciones necesarias para enviar tu solicitud.' },
  ];

  // Modelo de la descripción del emprendimiento (paso 2)
  descripcion = {
    resumen: '',
    diferencial: '',
    publicoObjetivo: '',
    proposito: '',
  };

  // Modelo de la historia del emprendimiento (paso 3)
  historia = {
    nombreComercial: '',
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

  // Helper: quita tildes y pasa a MAYÚSCULAS
  private normalizeText(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
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
  get isCategoriasComplete(): boolean {
  return this.selectedCategoriesCount > 0 && this.selectedCategoriesCount <= 2;
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

  // historia no puede ir vacía Y nombre comercial obligatorio
  get isHistoriaComplete(): boolean {
    return (
      this.historia.nombreComercial.trim().length > 0 &&
      this.historia.historiaGeneral.trim().length > 0
    );
  }

  // Nueva validación: provincia y ciudad obligatorias
  get isUbicacionComplete(): boolean {
    return !!this.ubicacion.provincia && !!this.ubicacion.ciudad;
  }

  // Nueva validación: tipo de emprendimiento obligatorio (no 0)
  get isTipoComplete(): boolean {
    return !!this.tipoEmprendimiento && this.tipoEmprendimiento !== 0;
  }

  // todos los inputs de presencia digital deben tener contenido (no solo espacios)
  get isPresenciaDigitalComplete(): boolean {
    const { instagram, /* sitioWeb, */ whatsapp, tiktok } = this.presenciaDigital;
    return (
      instagram.trim().length > 0 &&
      // sitioWeb ya no es obligatorio
      whatsapp.trim().length > 0 &&
      this.isWhatsappValid() &&
      tiktok.trim().length > 0
    );
  }

  // Valida teléfono Ecuador: acepta "+593" seguido de 9 dígitos o "09" seguido de 8 dígitos
  private validatePhoneEcuador(phone: string | null | undefined): boolean {
    if (!phone) return false;
    const raw = phone.replace(/\s+/g, '');
    const rePlus = /^\+593\d{9}$/; // ejemplo: +593991234567
    const reLocal = /^09\d{8}$/;   // ejemplo: 0991234567
    return rePlus.test(raw) || reLocal.test(raw);
  }

  // Método usado por template para mostrar estado válido/erróneo
  isWhatsappValid(): boolean {
    return this.validatePhoneEcuador(this.presenciaDigital.whatsapp);
  }

  // Paso 3 (ahora índice 3): multimedia
  get isMultimediaComplete(): boolean {
    const fotosCount = this.multimedia.fotosProductos.length;
    return !!this.multimedia.logo &&
      fotosCount > 0 &&
      fotosCount < 3;
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

  toggleCategory(cat: { id: number; label: string; selected: boolean }): void {
    if (!cat.selected && this.selectedCategoriesCount >= 2) {
      return;
    }
    cat.selected = !cat.selected;
  }
  prevStep(): void {
  if (this.currentStep > 0) {
    this.currentStep--;
  }
}


  nextStep(): void {
    if (this.currentStep === 0 && !this.isDescripcionComplete) return;
    if (this.currentStep === 1 && !this.isCategoriasComplete) return;
    if (
      this.currentStep === 2 &&
      (!this.isHistoriaComplete ||
      !this.isPresenciaDigitalComplete ||
      !this.isUbicacionComplete ||
      !this.isTipoComplete)
    ) return;
    if (this.currentStep === 3 && !this.isMultimediaComplete) return;
    if (this.currentStep === 4 && !this.isMetricasComplete) return;

  if (!this.isLastStep) {
    this.currentStep++;
  }
}

  finish(): void {
    if (!this.isMultimediaComplete || !this.isMetricasComplete || !this.isDeclaracionesComplete) {
      return;
    }

    const nowIso = new Date().toISOString();

    // Mapear provincia y ciudad seleccionadas
    const provinciaSeleccionada = this.provincias.find(p => p.id === Number(this.ubicacion.provincia));
    const ciudadSeleccionada = this.ciudadesFiltradas.find(c => c.id === Number(this.ubicacion.ciudad));

    const tipoSeleccionado = this.tiposEmprendimiento.find(t => t.id === this.tipoEmprendimiento);

    console.log('Provincia seleccionada:', provinciaSeleccionada);
    console.log('Ciudad seleccionada:', ciudadSeleccionada);
    console.log('Tipo de emprendimiento seleccionado:', tipoSeleccionado);

    const emprendimientoBase: EmprendimientoDto = {
      id: 0,
      correoComercial: '',
      correoUees: '',
      identificacion: '',
      parienteDirecto: '',
      nombreComercialEmprendimiento: this.historia.nombreComercial, // igual al texto original
      fechaCreacion: nowIso,
      ciudad: ciudadSeleccionada ? ciudadSeleccionada.id : 0,
      provinia: provinciaSeleccionada ? provinciaSeleccionada.id : 0,
      estadoEmpredimiento: true,
      tipoEmprendimiento: tipoSeleccionado ? tipoSeleccionado.tipo : '',
      tipoEmprendimientoId: this.tipoEmprendimiento,
      datosPublicos: this.presenciaDigital.aceptaMostrarPublicamente,
    };

    console.log(emprendimientoBase)

    const categoriasSeleccionadas: EmprendimientoCategoriaDto[] = this.categories
      .filter(c => c.selected)
      .map((c) => ({
        emprendimiento: emprendimientoBase,
        categoria: {
          id: c.id, // usar id que viene del API
          nombre: this.normalizeText(c.label),
          descripcion: '',
          urlImagen: '',
          idMultimedia: 0,
        },
        nombreCategoria: this.normalizeText(c.label),
      }));

    const descripciones: DescripcionDto[] = [
      {
        tipoDescripcion: this.normalizeText('RESUMEN'),
        descripcion: this.descripcion.resumen,
        maxCaracteres: 500,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('DIFERENCIAL'),
        descripcion: this.descripcion.diferencial,
        maxCaracteres: 1000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        // PUBLICO OBJETIVO (sin tilde y en mayúsculas)
        tipoDescripcion: this.normalizeText('PUBLICO OBJETIVO'),
        descripcion: this.descripcion.publicoObjetivo,
        maxCaracteres: 1000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('PROPOSITO'),
        descripcion: this.descripcion.proposito,
        maxCaracteres: 1000,
        obligatorio: true,
        idEmprendimiento: 0,
        emprendimientoId: 0,
      },
      {
        tipoDescripcion: this.normalizeText('HISTORIA'),
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
        valor: this.metricas.clientes, // en tu ejemplo es "100+" tal cual
      },
      {
        emprendimientoId: 0,
        metricaId: 2,
        valor: this.metricas.haGeneradoVentas ? 'SI' : 'NO',
      },
      {
        emprendimientoId: 0,
        metricaId: 3,
        valor: this.metricas.haParticipadoIncubacion
          ? (this.metricas.nombreProgramaIncubacion || 'SI')
          : 'NO',
      },
    ];

    const presenciasDigitales: PresenciaDigitalDto[] = [
      {
        emprendimientoId: 0,
        plataforma: 'instagram',
        descripcion: this.presenciaDigital.instagram,
      },
    ];
    if (this.presenciaDigital.sitioWeb && this.presenciaDigital.sitioWeb.trim().length > 0) {
      presenciasDigitales.push({
        emprendimientoId: 0,
        plataforma: 'sitio web',
        descripcion: this.presenciaDigital.sitioWeb,
      });
    }
    presenciasDigitales.push(
      {
        emprendimientoId: 0,
        plataforma: 'whatsapp',
        descripcion: this.presenciaDigital.whatsapp,
      },
      {
        emprendimientoId: 0,
        plataforma: 'tiktok',
        descripcion: this.presenciaDigital.tiktok,
      }
    );

    const participacionesComunidad: ParticipacionComunidadDto[] = [
      {
        emprendimientoId: 0,
        opcionParticipacionId: 1,
        respuesta: !!this.participacion.interesRankings,
        nombreOpcionParticipacion: this.normalizeText('RANKINGS'),
      },
      {
        emprendimientoId: 0,
        opcionParticipacionId: 2,
        respuesta: !!this.participacion.publicacionesMensuales,
        nombreOpcionParticipacion: this.normalizeText('PUBLICACIONESMENSUALES'),
      },
      {
        emprendimientoId: 0,
        opcionParticipacionId: 4,
        respuesta: !!this.participacion.recibirFeedback,
        nombreOpcionParticipacion: this.normalizeText('FEEDBACK'),
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
        declaracionId: 4,
        aceptada: this.declaraciones.autorizaUsoImagenes,
        fechaAceptacion: nowIso,
        nombreFirma: '',
      },
      {
        emprendimientoId: 0,
        declaracionId: 5,
        aceptada: this.declaraciones.aceptaPoliticasCentro,
        fechaAceptacion: nowIso,
        nombreFirma: '',
      },
    ];

    // Convertir archivos a base64 y agregarlos al array imagenes
    const imagenes: { nombre: string, binary: string, tipo: string }[] = [];
    const promesas: Promise<void>[] = [];

    const agregarArchivo = (file: File, nombre: string) => {
      const prom = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          imagenes.push({
            nombre,
            binary: (reader.result as string).split(',')[1],
            tipo: file.type
          });
          resolve();
        };
        reader.readAsDataURL(file);
      });
      promesas.push(prom);
    };

    if (this.multimedia.logo) agregarArchivo(this.multimedia.logo, `LOGO.PNG`);
    if (this.multimedia.banner) agregarArchivo(this.multimedia.banner, `BANNER.PNG`);
    if (this.multimedia.videoPresentacion) agregarArchivo(this.multimedia.videoPresentacion, `VIDEO.MP4`);
    if (this.multimedia.fotosProductos.length > 0) agregarArchivo(this.multimedia.fotosProductos[0], `FOTOPRODUCTO_1.PNG`);
    if (this.multimedia.fotosProductos.length > 1) agregarArchivo(this.multimedia.fotosProductos[1], `FOTOPRODUCTO_2.PNG`);

    const tiposMultimedia: string[] = [];
    if (this.multimedia.logo) tiposMultimedia.push('LOGO');
    if (this.multimedia.fotosProductos.length > 0) tiposMultimedia.push('FOTOSPRODUCTOS');
    if (this.multimedia.banner) tiposMultimedia.push('BANNER');
    if (this.multimedia.videoPresentacion) tiposMultimedia.push('VIDEO');

    this.loading = true;
    Promise.all(promesas).then(() => {
      // Obtener usuarioId desde localStorage
      const usuarioLocal = this.authService.getPerfilLocal();
      const usuarioId = usuarioLocal && usuarioLocal.id ? usuarioLocal.id : 0;
      const data: SolicitudEmprendimientoDataDto = {
        usuarioId,
        emprendimiento: emprendimientoBase,
        tipoAccion: 'BORRADOR',
        categorias: categoriasSeleccionadas,
        descripciones,
        metricas,
        presenciasDigitales,
        participacionesComunidad,
        declaracionesFinales,
        tiposMultimedia,
      };

    const files: File[] = [];
    if (this.multimedia.logo) files.push(new File([this.multimedia.logo], 'LOGO.PNG', { type: this.multimedia.logo.type }));
    if (this.multimedia.banner) files.push(new File([this.multimedia.banner], 'BANNER.PNG', { type: this.multimedia.banner.type }));
    if (this.multimedia.videoPresentacion) files.push(new File([this.multimedia.videoPresentacion], 'VIDEO.MP4', { type: this.multimedia.videoPresentacion.type }));
    if (this.multimedia.fotosProductos.length > 0) files.push(new File([this.multimedia.fotosProductos[0]], 'FOTOPRODUCTO_1.PNG', { type: this.multimedia.fotosProductos[0].type }));
    if (this.multimedia.fotosProductos.length > 1) files.push(new File([this.multimedia.fotosProductos[1]], 'FOTOPRODUCTO_2.PNG', { type: this.multimedia.fotosProductos[1].type }));

    console.log(data);

    this.loading = true;
    this.emprendimientoService.grabarEmprendimiento(data, files).subscribe({
        next: (resp: EmprendimientoCrearResponse) => {
          console.log('Emprendimiento grabado correctamente', resp);
          this.emprendimientoService.enviarAprobacion(resp.id).subscribe({
            next: () => {
              console.log('Emprendimiento enviado para aprobación');
            },
            error: (err) => {
              console.error('Error al enviar emprendimiento para aprobación', err);
            }
          });
          this.onEmprendimientoCreated.emit();
          this.loading = false;

          // Emitir al componente padre para que cierre el modal y refresque
          this.created.emit(resp);
        },
        error: (err) => {
          console.error('Error al grabar emprendimiento', err);
          this.loading = false;
        },
      });
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
