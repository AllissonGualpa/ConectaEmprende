import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ProvinciasSearchComponent } from '../../../../../shared/general/provincias-search/provincias-searc.component';
import { CiudadesSearchComponent } from '../../../../../shared/general/ciudades-search/ciudades-search.component';
import { Provincia, Ciudad, Categoria } from '../../../../../shared/general/shared-general.types';
import { OpcionPersonaJuridica, TipoEmprendimiento, Descripcion } from '../../../../../core/types/emprendimiento.types';
import { EmprendimientoService } from '../../../../../core/services/emprendimiento.service';
import { SharedGeneralService } from '../../../../../shared/general/shared-general.service';

@Component({
  selector: 'app-details-emprendimiento',
  templateUrl: './details-emprendimiento.component.html',
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
    ProvinciasSearchComponent,
    CiudadesSearchComponent
  ]
})
export class DetailsEmprendimientoComponent implements OnInit {
  emprendimientoForm!: FormGroup;
  showCarreraFields = false;
  showParienteField = false;
  showOtraCategoria = false;
  currentStep = 1;
  
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

  constructor(
    private fb: FormBuilder,
    private emprendimientoService: EmprendimientoService,
    private sharedGeneralService: SharedGeneralService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupConditionalValidations();
    this.loadData();
  }

  initForm(): void {
    this.emprendimientoForm = this.fb.group({
      // Sección 1: Información del representante
      nombreCompleto: ['', Validators.required],
      numeroTelefonico: ['', Validators.required],
      correoCoorporativo: ['', [Validators.required, Validators.email]],
      correoPersonal: ['', [Validators.required, Validators.email]],
      identificacion: ['', Validators.required],
      tienePariente: ['', Validators.required],
      carrera: [''],
      anoGraduacion: [''],
      nombrePariente: [''],
      integrantesEmprendedor: ['', Validators.required],
      
      // Sección 2: Información del emprendimiento
      nombreComercial: [''],
      anoCreacion: [''],
      ciudad: [null],
      provincia: [null],
      tipoEmprendimiento: [''],
      emprendimientoActivo: [''],
      personaJuridica: [''],
      
      // Sección 3: Categorías
      categorias: [[]],
      otraCategoria: [''],

      // Sección 4: Descripciones
      resumenGeneral: ['', Validators.required],
      queLoHaceDiferente: ['', Validators.required],
      publicoObjetivo: ['', Validators.required],
      proposito: ['', Validators.required],

      // Sección 5: Historia y Presencia Digital
      historiaEmprendimiento: ['', Validators.required],
      instagram: [''],
      sitioWeb: [''],
      whatsapp: [''],
      tiktok: [''],

      // Sección 6: Multimedia
      logo: [null, Validators.required],
      fotosProductos: [null, Validators.required],
      video: [null],
      banner: [null]
    });
  }

  setupConditionalValidations(): void {
    this.emprendimientoForm.get('identificacion')?.valueChanges.subscribe(value => {
      this.showCarreraFields = value === 'Estudiante' || value === 'Alumni';
      
      if (this.showCarreraFields) {
        this.emprendimientoForm.get('carrera')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('anoGraduacion')?.setValidators([Validators.required]);
      } else {
        this.emprendimientoForm.get('carrera')?.clearValidators();
        this.emprendimientoForm.get('anoGraduacion')?.clearValidators();
        this.emprendimientoForm.get('carrera')?.setValue('');
        this.emprendimientoForm.get('anoGraduacion')?.setValue('');
      }
      
      this.emprendimientoForm.get('carrera')?.updateValueAndValidity();
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
  }

  loadData(): void {
    this.emprendimientoService.getTiposEmprendimiento().subscribe({
      next: (tipos) => {
        this.tiposEmprendimiento = tipos;
      },
      error: (error) => {
        console.error('Error al cargar tipos de emprendimiento:', error);
      }
    });

    this.emprendimientoService.getOpcionesPersonaJuridica().subscribe({
      next: (opciones) => {
        this.opcionesPersonaJuridica = opciones.filter(o => o.estado);
      },
      error: (error) => {
        console.error('Error al cargar opciones persona jurídica:', error);
      }
    });

    this.sharedGeneralService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });

    this.emprendimientoService.getDescripciones().subscribe({
      next: (descripciones) => {
        this.descripciones = descripciones.filter(d => d.estado);
      },
      error: (error) => {
        console.error('Error al cargar descripciones:', error);
      }
    });
  }

  // Métodos para manejo de archivos multimedia
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

  siguiente(): void {
    if (this.currentStep === 1) {
      const seccion1Fields = ['nombreCompleto', 'numeroTelefonico', 'correoCoorporativo', 
                              'correoPersonal', 'identificacion', 'tienePariente', 'integrantesEmprendedor'];
      
      if (this.showCarreraFields) {
        seccion1Fields.push('carrera', 'anoGraduacion');
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
      historiaControl?.markAsTouched();
      
      if (!historiaControl?.value || historiaControl?.value.trim() === '') {
        historiaControl?.setErrors({ required: true });
        return;
      }

      if (historiaControl?.valid) {
        this.currentStep = 6;
      }
    } else if (this.currentStep === 6) {
      // Validar multimedia
      if (!this.logoFile) {
        alert('El logo es requerido');
        return;
      }

      if (this.fotosProductos.length < 2) {
        alert('Debes subir mínimo 2 fotos de productos');
        return;
      }

      this.onSubmit();
    }
  }

  atras(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    console.log('Formulario completo:', this.emprendimientoForm.value);
    console.log('Logo:', this.logoFile);
    console.log('Fotos productos:', this.fotosProductos);
    console.log('Video:', this.videoFile);
    console.log('Banner:', this.bannerFile);
    
    // Aquí puedes crear un FormData para enviar al backend
    const formData = new FormData();
    
    // Agregar datos del formulario
    Object.keys(this.emprendimientoForm.value).forEach(key => {
      if (key !== 'logo' && key !== 'fotosProductos' && key !== 'video' && key !== 'banner') {
        formData.append(key, this.emprendimientoForm.value[key]);
      }
    });
    
    // Agregar archivos
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
    
    this.fotosProductos.forEach((foto, index) => {
      formData.append(`fotoProducto${index + 1}`, foto);
    });
    
    if (this.videoFile) {
      formData.append('video', this.videoFile);
    }
    
    if (this.bannerFile) {
      formData.append('banner', this.bannerFile);
    }
    
    alert('Formulario enviado correctamente!');
    // Aquí enviar formData al backend
  }
}