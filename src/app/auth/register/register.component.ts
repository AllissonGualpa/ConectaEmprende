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

// Validador a nivel de formulario para comparar contraseñas
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('contrasena')?.value;
  const confirmPassword = group.get('confirmarContrasena')?.value;

  // Solo validar si ambos campos tienen valores
  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [provideNativeDateAdapter()],
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
      confirmarContrasena: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });

    this.secondFormGroup = this._formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      identificacion: ['', Validators.required],
      parienteDirecto: ['', Validators.required],
    });

    this.thirdFormGroup = this._formBuilder.group({
      nombreComercialEmprendimiento: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      provincia: ['', Validators.required],
      ciudad: ['', Validators.required],
      estadoEmprendimiento: ['', Validators.required],
      tipoEmprendimiento: ['', Validators.required]
    });

    // Escuchar cambios en los campos de contraseña para actualizar la validación
    this.firstFormGroup.get('contrasena')?.valueChanges.subscribe(() => {
      this.firstFormGroup.updateValueAndValidity();
    });

    this.firstFormGroup.get('confirmarContrasena')?.valueChanges.subscribe(() => {
      this.firstFormGroup.updateValueAndValidity();
    });

    this.firstFormGroup.valueChanges.subscribe(() => {
      const pass = this.firstFormGroup.get('contrasena')?.value;
      const confirmControl = this.firstFormGroup.get('confirmarContrasena');
      const confirm = confirmControl?.value;

      if (!confirmControl) return;

      // Si ambos campos tienen valor y no coinciden, agregar el error passwordMismatch al control de confirmación
      if (pass && confirm && pass !== confirm) {
        const existing = confirmControl.errors || {};
        if (!existing['passwordMismatch']) {
          confirmControl.setErrors({ ...existing, passwordMismatch: true });
        }
      } else {
        // Si coinciden o alguno está vacío, remover passwordMismatch sin borrar otros errores (como required)
        const errors = { ...(confirmControl.errors || {}) } as { [key: string]: any };
        if (errors['passwordMismatch']) {
          delete errors['passwordMismatch'];
          const keys = Object.keys(errors);
          confirmControl.setErrors(keys.length ? errors : null);
        }
      }
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