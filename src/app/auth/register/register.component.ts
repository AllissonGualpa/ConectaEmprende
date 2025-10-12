import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from "@angular/material/icon";
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DATE_LOCALE as MAT_DATE_LOCALE_TOKEN } from '@angular/material/core';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


// Validador a nivel de formulario para comparar contraseñas
// export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
//   const password = group.get('contrasena')?.value;
//   const confirmPassword = group.get('confirmarContrasena')?.value;
// 
//   if (!password || !confirmPassword) {
//     return null;
//   }
// 
//   return password === confirmPassword ? null : { passwordMismatch: true };
// }

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [provideNativeDateAdapter(),
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
    MatIcon,
    MatDatepickerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  hide = true;
  hideConfirm = true;
  
  // Variables para controlar la visibilidad de campos condicionales
  mostrarCamposEstudiante = false;
  mostrarCampoPariente = false;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correoUees: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      // confirmarContrasena: ['', [Validators.required]]
    }); //, { validators: passwordMatchValidator });

    this.secondFormGroup = this._formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      identificacion: ['', Validators.required],
      carrera: [''],
      anioEstudio: [''],
      parienteDirecto: ['', Validators.required],
      nombrePariente: ['']
    });

    this.thirdFormGroup = this._formBuilder.group({
      nombreComercialEmprendimiento: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      provincia: ['', Validators.required],
      ciudad: ['', Validators.required],
      estadoEmprendimiento: ['', Validators.required],
      tipoEmprendimiento: ['', Validators.required]
    });

    // Escuchar cambios en los campos de contraseña
    // this.firstFormGroup.get('contrasena')?.valueChanges.subscribe(() => {
    //   this.firstFormGroup.updateValueAndValidity();
    // });
    // 
    // this.firstFormGroup.get('confirmarContrasena')?.valueChanges.subscribe(() => {
    //   this.firstFormGroup.updateValueAndValidity();
    // });
    // 
    // this.firstFormGroup.valueChanges.subscribe(() => {
    //   const pass = this.firstFormGroup.get('contrasena')?.value;
    //   const confirmControl = this.firstFormGroup.get('confirmarContrasena');
    //   const confirm = confirmControl?.value;
    // 
    //   if (!confirmControl) return;
    // 
    //   if (pass && confirm && pass !== confirm) {
    //     const existing = confirmControl.errors || {};
    //     if (!existing['passwordMismatch']) {
    //       confirmControl.setErrors({ ...existing, passwordMismatch: true });
    //     }
    //   } else {
    //     const errors = { ...(confirmControl.errors || {}) } as { [key: string]: any };
    //     if (errors['passwordMismatch']) {
    //       delete errors['passwordMismatch'];
    //       const keys = Object.keys(errors);
    //       confirmControl.setErrors(keys.length ? errors : null);
    //     }
    //   }
    // });

    // Escuchar cambios en el campo de identificación
    this.secondFormGroup.get('identificacion')?.valueChanges.subscribe((value) => {
      const carreraControl = this.secondFormGroup.get('carrera');
      const anioControl = this.secondFormGroup.get('anioEstudio');

      if (value === 'Estudiante') {
        this.mostrarCamposEstudiante = true;
        carreraControl?.setValidators([Validators.required]);
        anioControl?.setValidators([Validators.required]);
      } else {
        this.mostrarCamposEstudiante = false;
        carreraControl?.clearValidators();
        anioControl?.clearValidators();
        carreraControl?.setValue('');
        anioControl?.setValue('');
      }
      carreraControl?.updateValueAndValidity();
      anioControl?.updateValueAndValidity();
    });

    // Escuchar cambios en el campo de pariente directo
    this.secondFormGroup.get('parienteDirecto')?.valueChanges.subscribe((value) => {
      const nombreParienteControl = this.secondFormGroup.get('nombrePariente');

      if (value === 'si') {
        this.mostrarCampoPariente = true;
        nombreParienteControl?.setValidators([Validators.required]);
      } else {
        this.mostrarCampoPariente = false;
        nombreParienteControl?.clearValidators();
        nombreParienteControl?.setValue('');
      }
      nombreParienteControl?.updateValueAndValidity();
    });
  }

  guardar() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
      const data = {
        ...this.firstFormGroup.value,
        ...this.secondFormGroup.value,
        ...this.thirdFormGroup.value
      };
      console.log('Formulario completo:', data);
    } else {
      console.log('Formulario inválido');
    }
  }
}