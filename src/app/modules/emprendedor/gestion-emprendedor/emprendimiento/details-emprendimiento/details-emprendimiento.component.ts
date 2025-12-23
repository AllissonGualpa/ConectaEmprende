import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProvinciasSearchComponent } from '../../../../../shared/general/provincias-search/provincias-searc.component';
import { CiudadesSearchComponent } from '../../../../../shared/general/ciudades-search/ciudades-search.component';
import { Provincia, Ciudad, Categoria } from '../../../../../shared/general/shared-general.types';
import { OpcionPersonaJuridica, TipoEmprendimiento } from '../../../../../core/types/emprendimiento.types';
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
      otraCategoria: ['']
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
      // Validar solo los campos de la sección 1
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
        // Agregar validaciones a la sección 2
        this.emprendimientoForm.get('nombreComercial')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('anoCreacion')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('ciudad')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('provincia')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('tipoEmprendimiento')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('emprendimientoActivo')?.setValidators([Validators.required]);
        this.emprendimientoForm.get('personaJuridica')?.setValidators([Validators.required]);
        
        this.emprendimientoForm.get('nombreComercial')?.updateValueAndValidity();
        this.emprendimientoForm.get('anoCreacion')?.updateValueAndValidity();
        this.emprendimientoForm.get('ciudad')?.updateValueAndValidity();
        this.emprendimientoForm.get('provincia')?.updateValueAndValidity();
        this.emprendimientoForm.get('tipoEmprendimiento')?.updateValueAndValidity();
        this.emprendimientoForm.get('emprendimientoActivo')?.updateValueAndValidity();
        this.emprendimientoForm.get('personaJuridica')?.updateValueAndValidity();
        
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2) {
      // Validar sección 2
      const seccion2Fields = ['nombreComercial', 'anoCreacion', 'ciudad', 'provincia', 
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
        // Agregar validación a sección 3
        this.emprendimientoForm.get('categorias')?.setValidators([Validators.required, Validators.minLength(1)]);
        this.emprendimientoForm.get('categorias')?.updateValueAndValidity();
        
        this.currentStep = 3;
      }
    } else if (this.currentStep === 3) {
      // Validar sección 3
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
        this.onSubmit();
      }
    }
  }

  atras(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.emprendimientoForm.valid) {
      console.log('Formulario válido:', this.emprendimientoForm.value);
      // Aquí enviar datos al backend
    } else {
      Object.keys(this.emprendimientoForm.controls).forEach(key => {
        this.emprendimientoForm.get(key)?.markAsTouched();
      });
    }
  }
}