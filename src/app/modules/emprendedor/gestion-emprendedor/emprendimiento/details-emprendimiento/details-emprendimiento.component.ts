import { CanActivate } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProvinciasSearchComponent } from '../../../../../shared/general/provincias-search/provincias-searc.component';
import { CiudadesSearchComponent } from '../../../../../shared/general/ciudades-search/ciudades-search.component';
import { Provincia, Ciudad, Categoria } from '../../../../../shared/general/shared-general.types';
import { OpcionPersonaJuridica, TipoEmprendimiento, Descripcion, OpcionParticipacionComunidad, DeclaracionFinal, EmprendimientoDetalle } from '../../../../../core/types/emprendimiento.types';
import { EmprendimientoService } from '../../../../../core/services/emprendimiento.service';
import { SharedGeneralService } from '../../../../../shared/general/shared-general.service';
import { AuthService } from '../../../../auth/auth.service';
import { SolicitudesService } from '../../../../../core/services/solicitudes.service';
import { forkJoin } from 'rxjs';

@Component({
	selector: 'app-details-emprendimiento',
	templateUrl: './details-emprendimiento.component.html',
	styleUrls: ['./details-emprendimiento.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatInputModule,
		MatFormFieldModule,
		MatRadioModule,
		MatButtonModule,
		MatCheckboxModule,
		MatIconModule,
		MatProgressSpinnerModule,
		ProvinciasSearchComponent,
		CiudadesSearchComponent
	]
})
export class DetailsEmprendimientoComponent implements OnInit {
	@Input() modo: 'crear' | 'editar-emprendedor' | 'revisar-admin' = 'crear';
	@Input() emprendimientoId?: number;
	@Input() solicitudId?: number;
	
	@Output() emprendimientoCreado = new EventEmitter<void>();
	@Output() emprendimientoEditado = new EventEmitter<void>();
	
	emprendimientoForm!: FormGroup;
	showCarreraFields = false;
	showSemestreField = false;
	showAnoGraduacionField = false;
	showParienteField = false;
	showOtraCategoria = false;
	currentStep = 1;

	// 🔥 NUEVO: Estados de carga
	cargandoDatos = false;
	datosBasicosCargados = false;
	datosEmprendimientoCargados = false;

	// Datos para sección 2
	tiposEmprendimiento: TipoEmprendimiento[] = [];
	opcionesPersonaJuridica: OpcionPersonaJuridica[] = [];
	provinciaSeleccionada: Provincia | null = null;

	// Datos para sección 3
	categorias: Categoria[] = [];
	categoriasSeleccionadas: number[] = [];

	// Datos para sección 4 y 5
	descripciones: Descripcion[] = [];

	// Datos para sección 6 - Multimedia
	logoFile: File | null = null;
	logoPreview: string | null = null;
	fotosProductos: File[] = [];
	fotosProductosPreview: string[] = [];
	videoFile: File | null = null;
	videoPreview: string | null = null;
	bannerFile: File | null = null;
	bannerPreview: string | null = null;
	logoSeleccionado: boolean = false;
	bannerSeleccionado: boolean = false;
	videoSeleccionado: boolean = false;
	fotosProductosSeleccionadas: boolean = false;

	// Datos para sección 7
	opcionesParticipacionComunidad: OpcionParticipacionComunidad[] = [];

	// Datos para sección 8
	declaracionesFinales: DeclaracionFinal[] = [];

	// Datos para comparación (solo admin)
	datosOriginales?: EmprendimientoDetalle;
	diferencias?: any[];

	constructor(
		private fb: FormBuilder,
		private emprendimientoService: EmprendimientoService,
		private sharedGeneralService: SharedGeneralService,
		private solicitudesService: SolicitudesService,
		private authService: AuthService 
	) { }

	ngOnInit(): void {
		this.initForm();
		this.setupConditionalValidations();
		this.cargarDatosIniciales();
	}

	// 🔥 NUEVO: Método unificado para cargar todos los datos
	private cargarDatosIniciales(): void {
		this.cargandoDatos = true;

		// Cargar datos básicos del sistema (catálogos, tipos, etc.)
		const datosBasicos$ = forkJoin({
			tiposEmprendimiento: this.emprendimientoService.getTiposEmprendimiento(),
			opcionesPersonaJuridica: this.emprendimientoService.getOpcionesPersonaJuridica(),
			categorias: this.sharedGeneralService.getCategorias(),
			descripciones: this.emprendimientoService.getDescripciones(),
			opcionesParticipacion: this.emprendimientoService.getOpcionesParticipacionComunidad(),
			declaraciones: this.emprendimientoService.getDeclaracionesFinales()
		});

		datosBasicos$.subscribe({
			next: (datos) => {
				// Asignar datos básicos
				this.tiposEmprendimiento = datos.tiposEmprendimiento;
				this.opcionesPersonaJuridica = datos.opcionesPersonaJuridica.filter(o => o.estado);
				this.categorias = datos.categorias;
				this.descripciones = datos.descripciones.filter(d => d.estado);
				this.opcionesParticipacionComunidad = datos.opcionesParticipacion;
				this.declaracionesFinales = datos.declaraciones;

				// Agregar controles dinámicos
				this.agregarControlesDinamicos();

				this.datosBasicosCargados = true;

				// Ahora cargar datos del emprendimiento si es necesario
				this.cargarDatosSegunModo();
			},
			error: (error) => {
				console.error('Error al cargar datos básicos:', error);
				this.cargandoDatos = false;
				alert('Error al cargar los datos iniciales. Por favor, recarga la página.');
			}
		});
	}

	// 🔥 Agregar controles dinámicos después de cargar datos
	private agregarControlesDinamicos(): void {
		// Participación comunidad
		this.opcionesParticipacionComunidad.forEach(opcion => {
			this.emprendimientoForm.addControl(
				`participacion_${opcion.id}`,
				this.fb.control('', Validators.required)
			);
		});

		// Declaraciones finales
		this.declaracionesFinales.forEach(declaracion => {
			const validators = declaracion.obligatoria ? [Validators.requiredTrue] : [];
			this.emprendimientoForm.addControl(
				`declaracion_${declaracion.id}`,
				this.fb.control(false, validators)
			);
		});
	}

	private cargarDatosSegunModo(): void {
		switch (this.modo) {
			case 'editar-emprendedor':
				this.cargarEmprendimientoEmprendedor();
				break;
			case 'revisar-admin':
				this.cargarSolicitudAdmin();
				break;
			case 'crear':
			default:
				// No cargar nada, formulario vacío
				this.cargandoDatos = false;
				this.datosEmprendimientoCargados = true;
				break;
		}
	}

	private cargarEmprendimientoEmprendedor(): void {
		if (!this.emprendimientoId) {
			console.error('No se proporcionó emprendimientoId');
			this.cargandoDatos = false;
			return;
		}

		this.solicitudesService.obtenerMiVistaSolicitud(this.emprendimientoId).subscribe({
			next: (response) => {
				console.log('Mi vista emprendedor:', response);
				
				const datosAMostrar = response.tieneSolicitudActiva 
					? response.datosPropuestos 
					: response.datosActuales;
				
				this.llenarFormulario(datosAMostrar);
				
				if (response.tieneSolicitudActiva) {
					console.log('Tiene solicitud activa:', response.estadoSolicitud);
					console.log('Observaciones:', response.observaciones);
				}

				this.datosEmprendimientoCargados = true;
				this.cargandoDatos = false;
			},
			error: (error) => {
				console.error('Error al cargar mi vista:', error);
				this.cargandoDatos = false;
				alert('Error al cargar los datos del emprendimiento');
			}
		});
	}

	private cargarSolicitudAdmin(): void {
		if (!this.solicitudId) {
			console.error('No se proporcionó solicitudId');
			this.cargandoDatos = false;
			return;
		}

		this.solicitudesService.obtenerDetalleSolicitudAdmin(this.solicitudId).subscribe({
			next: (response) => {
				console.log('Detalle solicitud admin:', response);
				
				this.llenarFormulario(response.datosPropuestos);
				
				if (response.datosOriginales) {
					this.datosOriginales = response.datosOriginales;
					this.diferencias = response.diferencias;
					console.log('Diferencias encontradas:', this.diferencias);
				}

				this.datosEmprendimientoCargados = true;
				this.cargandoDatos = false;
			},
			error: (error) => {
				console.error('Error al cargar solicitud admin:', error);
				this.cargandoDatos = false;
				alert('Error al cargar los datos de la solicitud');
			}
		});
	}

	// 🔥 GETTER para saber si está todo listo
	get datosCompletamenteCargados(): boolean {
		return this.datosBasicosCargados && this.datosEmprendimientoCargados;
	}

	private llenarFormulario(data: EmprendimientoDetalle): void {
		console.log('Llenando formulario con:', data);

		// Información del representante
		this.emprendimientoForm.patchValue({
			nombreCompleto: data.informacionRepresentante?.nombre || '',
			numeroTelefonico: data.informacionRepresentante?.telefono || '',
			correoCoorporativo: data.informacionRepresentante?.correoCorporativo || '',
			correoPersonal: data.informacionRepresentante?.correoPersonal || '',
			identificacion: data.informacionRepresentante?.identificacion || '',
			carrera: data.informacionRepresentante?.carrera || '',
			semestre: data.informacionRepresentante?.semestre || '',
			anoGraduacion: data.informacionRepresentante?.fechaGraduacion || '',
			tienePariente: data.informacionRepresentante?.tieneParientesUees ? 'SI' : 'NO',
			nombrePariente: data.informacionRepresentante?.nombrePariente || '',
			integrantesEmprendedor: data.informacionRepresentante?.integrantesEquipo || '',

			nombreComercial: data.nombreComercial || '',
			anoCreacion: data.anioCreacion ? new Date(data.anioCreacion).getFullYear() : '',
			tipoEmprendimiento: data.tipoEmprendimientoId || '',
			emprendimientoActivo: data.activoEmprendimiento ? 'SI' : 'NO',
			personaJuridica: (data as any).tipoPersonaJuridicaId || '',
			aceptaMostrarDatos: data.aceptaDatosPublicos ? 'SI' : 'NO'
		});

		if (data.ciudad?.provincia) {
			this.provinciaSeleccionada = data.ciudad.provincia;
			this.emprendimientoForm.patchValue({
				provincia: data.ciudad.provincia,
				ciudad: data.ciudad
			}, { emitEvent: true });
		}

		if (data.categorias && data.categorias.length > 0) {
			this.categoriasSeleccionadas = data.categorias.map(c => c.id);
			this.emprendimientoForm.patchValue({ categorias: this.categoriasSeleccionadas });
		}

		if (data.descripciones) {
			data.descripciones.forEach((desc: any) => {
				switch (desc.idDescripcion) {
					case 1:
						this.emprendimientoForm.patchValue({ resumenGeneral: desc.respuesta });
						break;
					case 2:
						this.emprendimientoForm.patchValue({ historiaEmprendimiento: desc.respuesta });
						break;
					case 3:
						this.emprendimientoForm.patchValue({ queLoHaceDiferente: desc.respuesta });
						break;
					case 4:
						this.emprendimientoForm.patchValue({ publicoObjetivo: desc.respuesta });
						break;
					case 5:
						this.emprendimientoForm.patchValue({ proposito: desc.respuesta });
						break;
				}
			});
		}

		if (data.presenciasDigitales) {
			data.presenciasDigitales.forEach((presencia: any) => {
				const campo = presencia.plataforma === 'sitio_web' ? 'sitioWeb' : presencia.plataforma;
				this.emprendimientoForm.patchValue({
					[campo]: presencia.descripcion
				});
			});
		}

		if (data.metricas) {
			data.metricas.forEach((metrica: any) => {
				switch (metrica.metricaId) {
					case 1:
						this.emprendimientoForm.patchValue({ cantidadClientes: metrica.valor });
						break;
					case 2:
						this.emprendimientoForm.patchValue({ generadoVentas: metrica.valor });
						break;
					case 3:
						this.emprendimientoForm.patchValue({ participadoIncubacion: metrica.valor });
						break;
				}
			});
		}

		if (data.multimedia && data.multimedia.length > 0) {
			this.cargarMultimediaExistente(data.multimedia);
		}

		if (data.participacionesComunidad) {
			data.participacionesComunidad.forEach((participacion: any) => {
				const valor = participacion.respuesta ? 'SI' : 'NO';
				this.emprendimientoForm.patchValue({
					[`participacion_${participacion.opcionParticipacionId}`]: valor
				});
			});
		}

		if (data.declaracionesFinales) {
			data.declaracionesFinales.forEach((declaracion: any) => {
				this.emprendimientoForm.patchValue({
					[`declaracion_${declaracion.declaracionId}`]: declaracion.aceptada
				});
			});
		}

		if (this.soloLectura) {
			this.emprendimientoForm.disable();
		}
	}

	private cargarMultimediaExistente(multimedia: any[]): void {
		multimedia.forEach(media => {
			const nombreLower = media.nombreActivo?.toLowerCase() || '';
			
			if (nombreLower.includes('logo') || multimedia.indexOf(media) === 0) {
				this.logoPreview = media.urlArchivo;
				this.logoSeleccionado = true;
			} else if (nombreLower.includes('banner')) {
				this.bannerPreview = media.urlArchivo;
				this.bannerSeleccionado = true;
			} else if (nombreLower.includes('video') || media.urlArchivo?.includes('.mp4')) {
				this.videoPreview = media.urlArchivo;
				this.videoSeleccionado = true; 
			} else {
				this.fotosProductosPreview.push(media.urlArchivo);
				this.fotosProductosSeleccionadas = true;
			}
		});

		this.actualizarValidacionMultimedia();
	}

	private actualizarValidacionMultimedia(): void {
		if (this.logoSeleccionado && this.logoPreview) {
			const logoControl = this.emprendimientoForm.get('logo');
			logoControl?.clearValidators();
			logoControl?.updateValueAndValidity();
		}
		
		if (this.fotosProductosSeleccionadas && this.fotosProductosPreview.length >= 2) {
			const fotosControl = this.emprendimientoForm.get('fotosProductos');
			fotosControl?.clearValidators();
			fotosControl?.updateValueAndValidity();
		}
		
		if (this.videoSeleccionado && this.videoPreview) {
			const videoControl = this.emprendimientoForm.get('video');
			videoControl?.clearValidators();
			videoControl?.updateValueAndValidity();
		}
		
		if (this.bannerSeleccionado && this.bannerPreview) {
			const bannerControl = this.emprendimientoForm.get('banner');
			bannerControl?.clearValidators();
			bannerControl?.updateValueAndValidity();
		}
	}

	initForm(): void {
		this.emprendimientoForm = this.fb.group({
			nombreCompleto: ['', Validators.required],
			numeroTelefonico: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.pattern('^[0-9]{10}$')]],
			correoCoorporativo: ['', [Validators.required, Validators.email]],
			correoPersonal: ['', [Validators.required, Validators.email]],
			identificacion: ['', Validators.required],
			tienePariente: ['', Validators.required],
			carrera: [''],
			anoGraduacion: [''],
			semestre: [''],
			nombrePariente: [''],
			integrantesEmprendedor: ['', Validators.required],
			nombreComercial: [''],
			anoCreacion: [''],
			ciudad: [null],
			provincia: [null],
			tipoEmprendimiento: [''],
			emprendimientoActivo: [''],
			personaJuridica: [''],
			categorias: [[]],
			otraCategoria: [''],
			resumenGeneral: ['', Validators.required],
			queLoHaceDiferente: ['', Validators.required],
			publicoObjetivo: ['', Validators.required],
			proposito: ['', Validators.required],
			historiaEmprendimiento: ['', Validators.required],
			instagram: [''],
			sitioWeb: [''],
			whatsapp: [''],
			tiktok: [''],
			aceptaMostrarDatos: ['', Validators.required],
			logo: [null, Validators.required],
			fotosProductos: [null, Validators.required],
			video: [null],
			banner: [null],
			cantidadClientes: ['', Validators.required],
			generadoVentas: ['', Validators.required],
			participadoIncubacion: ['', Validators.required],
			nombreProgramaIncubacion: ['']
		});
	}

	setupConditionalValidations(): void {
		this.emprendimientoForm.get('identificacion')?.valueChanges.subscribe(value => {
			this.showCarreraFields = value === 'Estudiante' || value === 'Alumni';
			this.showSemestreField = value === 'Estudiante';
			this.showAnoGraduacionField = value === 'Alumni';

			this.emprendimientoForm.get('carrera')?.clearValidators();
			this.emprendimientoForm.get('semestre')?.clearValidators();
			this.emprendimientoForm.get('anoGraduacion')?.clearValidators();

			if (value === 'Estudiante') {
				this.emprendimientoForm.get('carrera')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('semestre')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('anoGraduacion')?.setValue('');
			} else if (value === 'Alumni') {
				this.emprendimientoForm.get('carrera')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('anoGraduacion')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('semestre')?.setValue('');
			} else {
				this.emprendimientoForm.get('carrera')?.setValue('');
				this.emprendimientoForm.get('semestre')?.setValue('');
				this.emprendimientoForm.get('anoGraduacion')?.setValue('');
			}

			this.emprendimientoForm.get('carrera')?.updateValueAndValidity();
			this.emprendimientoForm.get('semestre')?.updateValueAndValidity();
			this.emprendimientoForm.get('anoGraduacion')?.updateValueAndValidity();
		});

		this.emprendimientoForm.get('tienePariente')?.valueChanges.subscribe(value => {
			this.showParienteField = value === 'SI';

			if (this.showParienteField) {
				this.emprendimientoForm.get('nombrePariente')?.setValidators([Validators.required]);
			} else {
				this.emprendimientoForm.get('nombrePariente')?.clearValidators();
				this.emprendimientoForm.get('nombrePariente')?.setValue('');
			}

			this.emprendimientoForm.get('nombrePariente')?.updateValueAndValidity();
		});

		this.emprendimientoForm.get('participadoIncubacion')?.valueChanges.subscribe(value => {
			if (value === 'SI') {
				this.emprendimientoForm.get('nombreProgramaIncubacion')?.setValidators([Validators.required]);
			} else {
				this.emprendimientoForm.get('nombreProgramaIncubacion')?.clearValidators();
				this.emprendimientoForm.get('nombreProgramaIncubacion')?.setValue('');
			}

			this.emprendimientoForm.get('nombreProgramaIncubacion')?.updateValueAndValidity();
		});
	}

	get esCreacion(): boolean {
		return this.modo === 'crear';
	}

	get esEdicionEmprendedor(): boolean {
		return this.modo === 'editar-emprendedor';
	}

	get esRevisionAdmin(): boolean {
		return this.modo === 'revisar-admin';
	}

	get soloLectura(): boolean {
		return this.modo === 'revisar-admin';
	}

	get puedeEditar(): boolean {
		return this.modo === 'crear' || this.modo === 'editar-emprendedor';
	}

	get muestraComparacion(): boolean {
		return this.modo === 'revisar-admin' && this.datosOriginales != null;
	}

	// Resto de métodos (onLogoSelected, siguiente, atras, onSubmit, etc.) permanecen igual...
	// [CONTINÚA CON TUS MÉTODOS EXISTENTES]

	onLogoSelected(event: any): void {
		const file = event.target.files[0];
		if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
			this.logoFile = file;
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.logoPreview = e.target.result;
			};
			reader.readAsDataURL(file);
			this.emprendimientoForm.patchValue({ logo: file });
		} else {
			alert('Solo se permiten archivos JPG o PNG para el logo');
		}
	}

	removeLogo(): void {
		this.logoFile = null;
		this.logoPreview = null;
		this.emprendimientoForm.patchValue({ logo: null });
	}

	onFotosProductosSelected(event: any): void {
		const files = Array.from(event.target.files) as File[];

		if (this.fotosProductos.length + files.length > 2) {
			alert('Solo puedes subir un máximo de 2 fotos');
			return;
		}

		files.forEach(file => {
			if (file.type.startsWith('image/')) {
				this.fotosProductos.push(file);
				const reader = new FileReader();
				reader.onload = (e: any) => {
					this.fotosProductosPreview.push(e.target.result);
				};
				reader.readAsDataURL(file);
			}
		});

		this.emprendimientoForm.patchValue({ fotosProductos: this.fotosProductos });
	}

	removeFotoProducto(index: number): void {
		this.fotosProductos.splice(index, 1);
		this.fotosProductosPreview.splice(index, 1);
		this.emprendimientoForm.patchValue({ fotosProductos: this.fotosProductos.length > 0 ? this.fotosProductos : null });
	}

	onVideoSelected(event: any): void {
		const file = event.target.files[0];
		if (file && file.type.startsWith('video/')) {
			this.videoFile = file;
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.videoPreview = e.target.result;
			};
			reader.readAsDataURL(file);
			this.emprendimientoForm.patchValue({ video: file });
		} else {
			alert('Solo se permiten archivos de video');
		}
	}

	removeVideo(): void {
		this.videoFile = null;
		this.videoPreview = null;
		this.emprendimientoForm.patchValue({ video: null });
	}

	onBannerSelected(event: any): void {
		const file = event.target.files[0];
		if (file && file.type.startsWith('image/')) {
			this.bannerFile = file;
			const reader = new FileReader();
			reader.onload = (e: any) => {
				this.bannerPreview = e.target.result;
			};
			reader.readAsDataURL(file);
			this.emprendimientoForm.patchValue({ banner: file });
		} else {
			alert('Solo se permiten archivos de imagen para el banner');
		}
	}

	removeBanner(): void {
		this.bannerFile = null;
		this.bannerPreview = null;
		this.emprendimientoForm.patchValue({ banner: null });
	}

	getMaxLength(fieldName: string): number {
		const descripcionMap: { [key: string]: string } = {
			'resumenGeneral': 'Resumen general del emprendimiento',
			'queLoHaceDiferente': '¿Qué lo hace diferente o innovador?',
			'publicoObjetivo': '¿A qué público objetivo te diriges?',
			'proposito': '¿Cuál es el propósito o misión como emprendedor/a?',
			'historiaEmprendimiento': 'Historia del emprendimiento'
		};

		const descripcion = this.descripciones.find(d => d.descripcion === descripcionMap[fieldName]);
		return descripcion?.cantidadMaximaCaracteres || 500;
	}

	getRemainingChars(fieldName: string): number {
		const maxLength = this.getMaxLength(fieldName);
		const currentLength = this.emprendimientoForm.get(fieldName)?.value?.length || 0;
		return maxLength - currentLength;
	}

	onProvinciaSelected(provincia: Provincia | null): void {
		this.provinciaSeleccionada = provincia;
		this.emprendimientoForm.patchValue({
			provincia: provincia,
			ciudad: null
		});
	}

	onCiudadSelected(ciudad: Ciudad | null): void {
		this.emprendimientoForm.patchValue({
			ciudad: ciudad
		});
	}

	isCategoriaSelected(categoriaId: number): boolean {
		return this.categoriasSeleccionadas.includes(categoriaId);
	}

	toggleCategoria(categoriaId: number): void {
		if (this.isCategoriaSelected(categoriaId)) {
			this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter(id => id !== categoriaId);
		} else if (this.categoriasSeleccionadas.length < 2) {
			this.categoriasSeleccionadas.push(categoriaId);
		}
		this.emprendimientoForm.patchValue({ categorias: this.categoriasSeleccionadas });
	}

	onCategoriaChange(categoriaId: number, event: any): void {
		if (event.checked) {
			if (this.categoriasSeleccionadas.length < 2) {
				this.categoriasSeleccionadas.push(categoriaId);
			}
		} else {
			this.categoriasSeleccionadas = this.categoriasSeleccionadas.filter(id => id !== categoriaId);
		}
		this.emprendimientoForm.patchValue({ categorias: this.categoriasSeleccionadas });
	}

	toggleOtraCategoria(): void {
		this.showOtraCategoria = !this.showOtraCategoria;

		if (this.showOtraCategoria) {
			if (this.categoriasSeleccionadas.length >= 2) {
				this.showOtraCategoria = false;
				return;
			}
			this.emprendimientoForm.get('otraCategoria')?.setValidators([Validators.required]);
		} else {
			this.emprendimientoForm.get('otraCategoria')?.clearValidators();
			this.emprendimientoForm.get('otraCategoria')?.setValue('');
		}

		this.emprendimientoForm.get('otraCategoria')?.updateValueAndValidity();
	}

	onOtraCategoriaChange(event: any): void {
		this.showOtraCategoria = event.checked;

		if (this.showOtraCategoria) {
			this.emprendimientoForm.get('otraCategoria')?.setValidators([Validators.required]);
		} else {
			this.emprendimientoForm.get('otraCategoria')?.clearValidators();
			this.emprendimientoForm.get('otraCategoria')?.setValue('');
		}

		this.emprendimientoForm.get('otraCategoria')?.updateValueAndValidity();
	}

	toggleDeclaracion(declaracionId: number): void {
		const control = this.emprendimientoForm.get(`declaracion_${declaracionId}`);
		if (control) {
			control.setValue(!control.value);
		}
	}

	siguiente(): void {
		if (this.soloLectura) {
			if (this.currentStep < 8) {
				this.currentStep++;
			}
			return;
		}

		if (this.currentStep === 1) {
			const seccion1Fields = ['nombreCompleto', 'numeroTelefonico', 'correoCoorporativo',
				'correoPersonal', 'identificacion', 'tienePariente', 'integrantesEmprendedor'];

			if (this.showCarreraFields) {
				seccion1Fields.push('carrera');
				if (this.showSemestreField) {
					seccion1Fields.push('semestre');
				}
				if (this.showAnoGraduacionField) {
					seccion1Fields.push('anoGraduacion');
				}
			}

			if (this.showParienteField) {
				seccion1Fields.push('nombrePariente');
			}

			let seccion1Valid = true;
			seccion1Fields.forEach(field => {
				const control = this.emprendimientoForm.get(field);
				control?.markAsTouched();
				if (control?.invalid) {
					seccion1Valid = false;
				}
			});

			if (seccion1Valid) {
				this.emprendimientoForm.get('nombreComercial')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('anoCreacion')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('tipoEmprendimiento')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('emprendimientoActivo')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('personaJuridica')?.setValidators([Validators.required]);

				this.emprendimientoForm.get('nombreComercial')?.updateValueAndValidity();
				this.emprendimientoForm.get('anoCreacion')?.updateValueAndValidity();
				this.emprendimientoForm.get('tipoEmprendimiento')?.updateValueAndValidity();
				this.emprendimientoForm.get('emprendimientoActivo')?.updateValueAndValidity();
				this.emprendimientoForm.get('personaJuridica')?.updateValueAndValidity();

				this.currentStep = 2;
			}
		} else if (this.currentStep === 2) {
			const seccion2Fields = ['nombreComercial', 'anoCreacion',
				'tipoEmprendimiento', 'emprendimientoActivo', 'personaJuridica'];

			let seccion2Valid = true;
			seccion2Fields.forEach(field => {
				const control = this.emprendimientoForm.get(field);
				control?.markAsTouched();
				if (control?.invalid) {
					seccion2Valid = false;
				}
			});

			if (seccion2Valid) {
				this.emprendimientoForm.get('categorias')?.setValidators([Validators.required]);
				this.emprendimientoForm.get('categorias')?.updateValueAndValidity();

				this.currentStep = 3;
			}
		} else if (this.currentStep === 3) {
			const categoriasControl = this.emprendimientoForm.get('categorias');
			categoriasControl?.markAsTouched();

			const totalSeleccionadas = this.categoriasSeleccionadas.length + (this.showOtraCategoria ? 1 : 0);

			if (totalSeleccionadas === 0) {
				categoriasControl?.setErrors({ required: true });
				return;
			}

			if (this.showOtraCategoria) {
				const otraCategoriaControl = this.emprendimientoForm.get('otraCategoria');
				otraCategoriaControl?.markAsTouched();

				if (otraCategoriaControl?.invalid) {
					return;
				}
			}

			if (totalSeleccionadas > 0) {
				this.currentStep = 4;
			}
		} else if (this.currentStep === 4) {
			const seccion4Fields = ['resumenGeneral', 'queLoHaceDiferente', 'publicoObjetivo', 'proposito'];

			let seccion4Valid = true;
			seccion4Fields.forEach(field => {
				const control = this.emprendimientoForm.get(field);
				control?.markAsTouched();
				if (control?.invalid || !control?.value || control?.value.trim() === '') {
					control?.setErrors({ required: true });
					seccion4Valid = false;
				}
			});

			if (seccion4Valid) {
				this.currentStep = 5;
			}
		} else if (this.currentStep === 5) {
			const historiaControl = this.emprendimientoForm.get('historiaEmprendimiento');
			const aceptaMostrarControl = this.emprendimientoForm.get('aceptaMostrarDatos');
			
			historiaControl?.markAsTouched();
			aceptaMostrarControl?.markAsTouched();

			if (!historiaControl?.value || historiaControl?.value.trim() === '') {
				historiaControl?.setErrors({ required: true });
				return;
			}

			if (historiaControl?.valid && aceptaMostrarControl?.valid) {
				this.currentStep = 6;
			}
		} else if (this.currentStep === 6) {
			const tieneLogo = !!this.logoFile || (this.logoSeleccionado && !!this.logoPreview);
			const totalFotos = this.fotosProductos.length + this.fotosProductosPreview.length;

			if (!tieneLogo) {
				alert('El logo es requerido');
				return;
			}

			if (totalFotos < 2) {
				alert(`Debes tener mínimo 2 fotos de productos. Actualmente tienes ${totalFotos}.`);
				return;
			}

			this.currentStep = 7;
		} else if (this.currentStep === 7) {
			const seccion7Fields = ['cantidadClientes', 'generadoVentas', 'participadoIncubacion'];

			let seccion7Valid = true;
			seccion7Fields.forEach(field => {
				const control = this.emprendimientoForm.get(field);
				control?.markAsTouched();
				if (control?.invalid) {
					seccion7Valid = false;
				}
			});

			if (this.emprendimientoForm.get('participadoIncubacion')?.value === 'SI') {
				const nombreProgramaControl = this.emprendimientoForm.get('nombreProgramaIncubacion');
				nombreProgramaControl?.markAsTouched();
				if (nombreProgramaControl?.invalid) {
					seccion7Valid = false;
				}
			}

			this.opcionesParticipacionComunidad.forEach(opcion => {
				const control = this.emprendimientoForm.get(`participacion_${opcion.id}`);
				control?.markAsTouched();
				if (control?.invalid) {
					seccion7Valid = false;
				}
			});

			if (seccion7Valid) {
				this.currentStep = 8;
			}
		} else if (this.currentStep === 8) {
			let seccion8Valid = true;

			this.declaracionesFinales.forEach(declaracion => {
				const control = this.emprendimientoForm.get(`declaracion_${declaracion.id}`);
				control?.markAsTouched();
				if (declaracion.obligatoria && !control?.value) {
					seccion8Valid = false;
				}
			});

			if (seccion8Valid) {
				this.onSubmit();
			} else {
				alert('Debes aceptar todas las declaraciones obligatorias');
			}
		}
	}

	atras(): void {
		if (this.currentStep > 1) {
			this.currentStep--;
		}
	}

	onSubmit(tipoAccion: 'CREAR' | 'BORRADOR' = 'CREAR'): void {
		const formValues = this.emprendimientoForm.value;
		const perfil = this.authService.getPerfilLocal();

		if (!perfil || !perfil.id) {
			alert('Debe iniciar sesión para crear un emprendimiento');
			return;
		}

		const tiposMultimedia: string[] = [];

		if (this.logoFile) {
			tiposMultimedia.push('LOGO');
		}

		this.fotosProductos.forEach(() => {
			tiposMultimedia.push('FOTO_PRODUCTO');
		});

		if (this.videoFile) {
			tiposMultimedia.push('VIDEO');
		}

		if (this.bannerFile) {
			tiposMultimedia.push('BANNER');
		}

		const requestBody = {
			usuarioId: perfil.id,
			tipoAccion: tipoAccion,
			emprendimiento: {
				nombreComercialEmprendimiento: formValues.nombreComercial,
				fechaCreacion: new Date().toISOString(),
				estadoEmpredimiento: formValues.emprendimientoActivo === 'SI',
				datosPublicos: formValues.aceptaMostrarDatos === 'SI',
				ciudad: formValues.ciudad?.id || null,
				tipoEmprendimientoId: formValues.tipoEmprendimiento,
				tipoPersonaJuridicaId: formValues.personaJuridica
			},
			informacionRepresentante: {
				nombre: formValues.nombreCompleto,
				telefono: formValues.numeroTelefonico,
				correoCorporativo: formValues.correoCoorporativo,
				correoPersonal: formValues.correoPersonal,
				identificacion: formValues.identificacion,
				carrera: formValues.carrera || null,
				semestre: formValues.semestre || null,
				fechaGraduacion: formValues.anoGraduacion || null,
				tieneParientesUees: formValues.tienePariente === 'SI',
				nombrePariente: formValues.nombrePariente || null,
				integrantesEquipo: formValues.integrantesEmprendedor
			},
			categorias: this.categoriasSeleccionadas.map(id => {
				const categoria = this.categorias.find(c => c.id === id);
				return {
					categoria: {
						id: id,
						nombre: categoria?.nombre || ''
					}
				};
			}),
			descripciones: [
				{ idDescripcion: 1, respuesta: formValues.resumenGeneral },
				{ idDescripcion: 2, respuesta: formValues.historiaEmprendimiento },
				{ idDescripcion: 3, respuesta: formValues.queLoHaceDiferente },
				{ idDescripcion: 4, respuesta: formValues.publicoObjetivo },
				{ idDescripcion: 5, respuesta: formValues.proposito }
			],
			metricas: [
				{ metricaId: 1, valor: formValues.cantidadClientes },
				{ metricaId: 2, valor: formValues.generadoVentas },
				{ metricaId: 3, valor: formValues.participadoIncubacion }
			],
			presenciasDigitales: [] as any[],
			participacionesComunidad: [] as any[],
			declaracionesFinales: [] as any[],
			tiposMultimedia: tiposMultimedia
		};

		if (formValues.instagram) {
			requestBody.presenciasDigitales.push({
				plataforma: 'instagram',
				descripcion: formValues.instagram
			});
		}
		if (formValues.whatsapp) {
			requestBody.presenciasDigitales.push({
				plataforma: 'whatsapp',
				descripcion: formValues.whatsapp
			});
		}
		if (formValues.sitioWeb) {
			requestBody.presenciasDigitales.push({
				plataforma: 'sitio_web',
				descripcion: formValues.sitioWeb
			});
		}
		if (formValues.tiktok) {
			requestBody.presenciasDigitales.push({
				plataforma: 'tiktok',
				descripcion: formValues.tiktok
			});
		}

		this.opcionesParticipacionComunidad.forEach(opcion => {
			const valor = formValues[`participacion_${opcion.id}`];
			requestBody.participacionesComunidad.push({
				opcionParticipacionId: opcion.id,
				respuesta: valor === 'SI'
			});
		});

		this.declaracionesFinales.forEach(declaracion => {
			const aceptada = formValues[`declaracion_${declaracion.id}`];
			requestBody.declaracionesFinales.push({
				declaracionId: declaracion.id,
				aceptada: aceptada,
				fechaAceptacion: aceptada ? new Date().toISOString() : null,
				nombreFirma: aceptada ? formValues.nombreCompleto : ''
			});
		});

		const formData = new FormData();
		formData.append('data', JSON.stringify(requestBody));

		if (this.logoFile) {
			formData.append('imagenes', this.logoFile);
		}

		this.fotosProductos.forEach((foto) => {
			formData.append('imagenes', foto);
		});

		if (this.videoFile) {
			formData.append('imagenes', this.videoFile);
		}

		if (this.bannerFile) {
			formData.append('imagenes', this.bannerFile);
		}

		this.emprendimientoService.crearEmprendimiento(formData).subscribe({
			next: (response) => {
				console.log('Emprendimiento creado exitosamente:', response);
				
				if (tipoAccion === 'CREAR') {
					const emprendimientoId = response.id || response;
					
					this.solicitudesService.enviarParaAprobacion(emprendimientoId).subscribe({
						next: (aprobacionResponse) => {
							console.log('Enviado para aprobación:', aprobacionResponse);
							alert('Emprendimiento creado y enviado para aprobación correctamente!');
							this.emprendimientoCreado.emit();
						},
						error: (error) => {
							console.error('Error al enviar para aprobación:', error);
							alert('Emprendimiento creado, pero hubo un error al enviar para aprobación.');
							this.emprendimientoCreado.emit();
						}
					});
				} else {
					alert('Borrador guardado correctamente!');
					this.emprendimientoCreado.emit();
				}
			},
			error: (error) => {
				console.error('Error al crear emprendimiento:', error);
				alert('Error al crear el emprendimiento. Por favor, intenta nuevamente.');
			}
		});
	}

	guardarBorrador(): void {
		this.onSubmit('BORRADOR');
	}
}