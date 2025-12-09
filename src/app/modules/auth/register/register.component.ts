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
import { AuthService, RegisterData } from '../auth.service';
import { Router } from '@angular/router';
import { LocationService, ProvinciaDto, CiudadDto } from '../../../core/services/location.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

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

  // Provincias y ciudades obtenidas desde la API
  provincias: ProvinciaDto[] = [];
  ciudadesFiltradas: { id: number; nombre: string }[] = [];

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
    private router: Router,
    private locationService: LocationService,
    private dialog: MatDialog
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

    // Cargar provincias desde la API
    this.locationService.getProvincias().subscribe({
      next: (provincias) => {
        this.provincias = provincias;
      },
      error: () => {
        // Manejo simple de error, puedes mejorarlo (snackbar, etc.)
        this.provincias = [];
      }
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

    // Filtrar ciudades según la provincia seleccionada usando la API
    this.thirdFormGroup.get('provincia')?.valueChanges.subscribe((provinciaId) => {
      if (!provinciaId) {
        this.ciudadesFiltradas = [];
        this.thirdFormGroup.get('ciudad')?.setValue('');
        return;
      }

      this.locationService.getCiudadesPorProvincia(provinciaId).subscribe({
        next: (ciudades: CiudadDto[]) => {
          this.ciudadesFiltradas = ciudades.map((c) => ({
            id: c.id,
            nombre: c.nombreCiudad,
          }));
          this.thirdFormGroup.get('ciudad')?.setValue('');
        },
        error: () => {
          this.ciudadesFiltradas = [];
          this.thirdFormGroup.get('ciudad')?.setValue('');
        },
      });
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

      const registerData: RegisterData = {
        nombre: firstForm.nombre,
        apellido: firstForm.apellido,
        fechaNacimiento: this.formatDateToISO(firstForm.fechaNacimiento as Date),
        genero: firstForm.genero,
        contrasena: firstForm.contrasena,
        correo: firstForm.correoUees,
        correoUees: secondForm.correo,
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
        next: () => {
          this.isLoading = false;
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Registro',
              title: 'Registro exitoso',
              subtitle: 'Bienvenido a Eureka Emprende!',
              type: 'success',
            },
          }).afterClosed().subscribe(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || error.message || 'Error desconocido';
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Registro',
              title: 'Error en el registro',
              subtitle: errorMessage,
              type: 'error',
            },
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.firstFormGroup);
      this.markFormGroupTouched(this.secondFormGroup);
      this.markFormGroupTouched(this.thirdFormGroup);

      // Usa el nuevo tipo visual 'warning' del MensajeConfirmacionComponent
      this.dialog.open(MensajeConfirmacionComponent, {
        width: '420px',
        data: {
          subject: 'Registro',
          title: 'Formulario incompleto',
          subtitle: 'Por favor, complete todos los campos requeridos correctamente.',
          type: 'warning',
        },
      });
    }
  }
}