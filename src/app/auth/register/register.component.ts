import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from "@angular/material/icon";
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../../shared/adapters/CustomDateAdapter';
import { AuthService, RegisterData } from '../../services/auth.service';
import { Router } from '@angular/router';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatError,
    MatDatepickerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  hide = true;
  hideConfirm = true;

  mostrarCamposEstudiante = false;
  mostrarCampoPariente = false;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  isLoading = false;

  // Provincias y ciudades de Ecuador
  provincias = [
    { id: 1, nombre: 'Azuay', ciudades: [{ id: 1, nombre: 'Cuenca' }, { id: 2, nombre: 'Gualaceo' }, { id: 3, nombre: 'Paute' }, { id: 4, nombre: 'Sígsig' }] },
    { id: 2, nombre: 'Bolívar', ciudades: [{ id: 5, nombre: 'Guaranda' }, { id: 6, nombre: 'San Miguel' }, { id: 7, nombre: 'Echeandía' }] },
    { id: 3, nombre: 'Cañar', ciudades: [{ id: 8, nombre: 'Azogues' }, { id: 9, nombre: 'Biblián' }, { id: 10, nombre: 'La Troncal' }] },
    { id: 4, nombre: 'Carchi', ciudades: [{ id: 11, nombre: 'Tulcán' }, { id: 12, nombre: 'Mira' }, { id: 13, nombre: 'Montúfar' }] },
    { id: 5, nombre: 'Chimborazo', ciudades: [{ id: 14, nombre: 'Riobamba' }, { id: 15, nombre: 'Guano' }, { id: 16, nombre: 'Alausí' }] },
    { id: 6, nombre: 'Cotopaxi', ciudades: [{ id: 17, nombre: 'Latacunga' }, { id: 18, nombre: 'La Maná' }, { id: 19, nombre: 'Salcedo' }] },
    { id: 7, nombre: 'El Oro', ciudades: [{ id: 20, nombre: 'Machala' }, { id: 21, nombre: 'Pasaje' }, { id: 22, nombre: 'Santa Rosa' }] },
    { id: 8, nombre: 'Esmeraldas', ciudades: [{ id: 23, nombre: 'Esmeraldas' }, { id: 24, nombre: 'Atacames' }, { id: 25, nombre: 'Quinindé' }] },
    { id: 9, nombre: 'Galápagos', ciudades: [{ id: 26, nombre: 'Puerto Ayora' }, { id: 27, nombre: 'Puerto Baquerizo Moreno' }] },
    { id: 10, nombre: 'Guayas', ciudades: [{ id: 28, nombre: 'Guayaquil' }, { id: 29, nombre: 'Daule' }, { id: 30, nombre: 'Samborondón' }, { id: 31, nombre: 'Milagro' }] },
    { id: 11, nombre: 'Imbabura', ciudades: [{ id: 32, nombre: 'Ibarra' }, { id: 33, nombre: 'Otavalo' }, { id: 34, nombre: 'Cotacachi' }] },
    { id: 12, nombre: 'Loja', ciudades: [{ id: 35, nombre: 'Loja' }, { id: 36, nombre: 'Catamayo' }, { id: 37, nombre: 'Macará' }] },
    { id: 13, nombre: 'Los Ríos', ciudades: [{ id: 38, nombre: 'Babahoyo' }, { id: 39, nombre: 'Quevedo' }, { id: 40, nombre: 'Vinces' }] },
    { id: 14, nombre: 'Manabí', ciudades: [{ id: 41, nombre: 'Portoviejo' }, { id: 42, nombre: 'Manta' }, { id: 43, nombre: 'Chone' }] },
    { id: 15, nombre: 'Morona Santiago', ciudades: [{ id: 44, nombre: 'Macas' }, { id: 45, nombre: 'Sucúa' }, { id: 46, nombre: 'Gualaquiza' }] },
    { id: 16, nombre: 'Napo', ciudades: [{ id: 47, nombre: 'Tena' }, { id: 48, nombre: 'Archidona' }] },
    { id: 17, nombre: 'Orellana', ciudades: [{ id: 49, nombre: 'Francisco de Orellana' }, { id: 50, nombre: 'Dayuma' }] },
    { id: 18, nombre: 'Pastaza', ciudades: [{ id: 51, nombre: 'Puyo' }, { id: 52, nombre: 'Mera' }] },
    { id: 19, nombre: 'Pichincha', ciudades: [{ id: 53, nombre: 'Quito' }, { id: 54, nombre: 'Cayambe' }, { id: 55, nombre: 'Sangolquí' }] },
    { id: 20, nombre: 'Santa Elena', ciudades: [{ id: 56, nombre: 'Santa Elena' }, { id: 57, nombre: 'La Libertad' }, { id: 58, nombre: 'Salinas' }] },
    { id: 21, nombre: 'Santo Domingo de los Tsáchilas', ciudades: [{ id: 59, nombre: 'Santo Domingo' }] },
    { id: 22, nombre: 'Sucumbíos', ciudades: [{ id: 60, nombre: 'Nueva Loja' }, { id: 61, nombre: 'Shushufindi' }] },
    { id: 23, nombre: 'Tungurahua', ciudades: [{ id: 62, nombre: 'Ambato' }, { id: 63, nombre: 'Baños' }, { id: 64, nombre: 'Pelileo' }] },
    { id: 24, nombre: 'Zamora Chinchipe', ciudades: [{ id: 65, nombre: 'Zamora' }, { id: 66, nombre: 'Yantzaza' }] },
  ];

  ciudadesFiltradas: { id: number, nombre: string }[] = [];

  // Tipos de emprendimiento según Supabase
  tiposEmprendimiento = [
    { id: 1, nombre: 'Startup', value: 'Startup' },
    { id: 2, nombre: 'Emprendimiento - Servicio', value: 'Servicio' },
    { id: 4, nombre: 'Emprendimiento - Producto', value: 'Producto' },
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>,
    private authService: AuthService,
    private router: Router
  ) {
    this.dateAdapter.setLocale('es-ES');
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correoUees: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.secondFormGroup = this._formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      identificacion: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      tipoUsuario: ['', Validators.required],
      carrera: [''],
      anioEstudio: [''],
      semestre: [''],
      fechaGraduacion: [''],
      parienteDirecto: ['', Validators.required],
      nombrePariente: [''],
      areaPariente: ['']
    });

    this.thirdFormGroup = this._formBuilder.group({
      nombreComercialEmprendimiento: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      provincia: ['', Validators.required],
      ciudad: ['', Validators.required],
      estadoEmprendimiento: ['', Validators.required],
      tipoEmprendimiento: ['', Validators.required],
      datosPublicos: [true]
    });

    // Mostrar campos de estudiante según selección
    this.secondFormGroup.get('tipoUsuario')?.valueChanges.subscribe((value) => {
      const carreraControl = this.secondFormGroup.get('carrera');
      const anioControl = this.secondFormGroup.get('anioEstudio');
      const semestreControl = this.secondFormGroup.get('semestre');
      const fechaGraduacionControl = this.secondFormGroup.get('fechaGraduacion');

      if (value === 'Estudiante') {
        this.mostrarCamposEstudiante = true;
        carreraControl?.setValidators([Validators.required]);
        anioControl?.setValidators([Validators.required]);
        semestreControl?.setValidators([Validators.required]);
        fechaGraduacionControl?.clearValidators();
      } else if (value === 'Alumni') {
        this.mostrarCamposEstudiante = true;
        carreraControl?.setValidators([Validators.required]);
        fechaGraduacionControl?.setValidators([Validators.required]);
        anioControl?.clearValidators();
        semestreControl?.clearValidators();
      } else {
        this.mostrarCamposEstudiante = false;
        carreraControl?.clearValidators();
        anioControl?.clearValidators();
        semestreControl?.clearValidators();
        fechaGraduacionControl?.clearValidators();
        carreraControl?.setValue('');
        anioControl?.setValue('');
        semestreControl?.setValue('');
        fechaGraduacionControl?.setValue('');
      }
      carreraControl?.updateValueAndValidity();
      anioControl?.updateValueAndValidity();
      semestreControl?.updateValueAndValidity();
      fechaGraduacionControl?.updateValueAndValidity();
    });

    // Mostrar campo pariente según selección
    this.secondFormGroup.get('parienteDirecto')?.valueChanges.subscribe((value) => {
      const nombreParienteControl = this.secondFormGroup.get('nombrePariente');
      const areaParienteControl = this.secondFormGroup.get('areaPariente');

      if (value === 'si') {
        this.mostrarCampoPariente = true;
        nombreParienteControl?.setValidators([Validators.required]);
        areaParienteControl?.setValidators([Validators.required]);
      } else {
        this.mostrarCampoPariente = false;
        nombreParienteControl?.clearValidators();
        areaParienteControl?.clearValidators();
        nombreParienteControl?.setValue('');
        areaParienteControl?.setValue('');
      }
      nombreParienteControl?.updateValueAndValidity();
      areaParienteControl?.updateValueAndValidity();
    });

    // Filtrar ciudades según la provincia seleccionada
    this.thirdFormGroup.get('provincia')?.valueChanges.subscribe((provinciaId) => {
      const provincia = this.provincias.find(p => p.id === provinciaId);
      this.ciudadesFiltradas = provincia ? provincia.ciudades : [];
      this.thirdFormGroup.get('ciudad')?.setValue('');
    });
  }

  shouldShowError(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.touched || formGroup.valid));
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private formatDateToISO(date: Date): string {
    return date.toISOString();
  }

  guardar() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
      this.isLoading = true;

      const firstForm = this.firstFormGroup.value;
      const secondForm = this.secondFormGroup.value;
      const thirdForm = this.thirdFormGroup.value;

      const idRolEmprendedor = 2;

      // CAMBIO PRINCIPAL: Ahora correo es correoUees y correoUees es el corporativo
      const registerData: RegisterData = {
        nombre: firstForm.nombre,
        apellido: firstForm.apellido,
        fechaNacimiento: this.formatDateToISO(firstForm.fechaNacimiento as Date),
        genero: firstForm.genero,
        contrasena: firstForm.contrasena,
        correo: firstForm.correoUees, // ← CORRECCIÓN: Correo principal es el de UEES
        correoUees: secondForm.correo, // ← CORRECCIÓN: Correo corporativo va aquí
        identificacion: secondForm.identificacion,
        parienteDirecto: secondForm.parienteDirecto === 'si',
        idRol: idRolEmprendedor,
        nombrePariente: secondForm.nombrePariente || undefined,
        areaPariente: secondForm.areaPariente || undefined,
        carrera: secondForm.carrera || undefined,
        fechaGraduacion: secondForm.fechaGraduacion ? this.formatDateToISO(secondForm.fechaGraduacion as Date) : undefined,
        anioEstudio: secondForm.anioEstudio || undefined,
        semestre: secondForm.semestre || undefined,
        emprendimiento: {
          correoComercial: secondForm.correo,
          correoUees: firstForm.correoUees,
          identificacion: secondForm.identificacion,
          parienteDirecto: secondForm.parienteDirecto === 'si' ? 'Si' : 'No',
          nombreComercialEmprendimiento: thirdForm.nombreComercialEmprendimiento,
          fechaCreacion: this.formatDateToISO(thirdForm.fechaCreacion as Date),
          ciudad: thirdForm.ciudad,
          provinia: thirdForm.provincia,
          estadoEmpredimiento: thirdForm.estadoEmprendimiento,
          tipoEmprendimiento: this.tiposEmprendimiento.find(t => t.id === thirdForm.tipoEmprendimiento)?.nombre || '',
          tipoEmprendimientoId: thirdForm.tipoEmprendimiento,
          datosPublicos: thirdForm.datosPublicos
        }
      };

      console.log('Datos a enviar:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          alert('Registro exitoso. Bienvenido a Eureka Emprende!');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || error.message || 'Error desconocido';
          alert('Error en el registro: ' + errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched(this.firstFormGroup);
      this.markFormGroupTouched(this.secondFormGroup);
      this.markFormGroupTouched(this.thirdFormGroup);
      alert('Por favor, complete todos los campos requeridos correctamente');
    }
  }
}