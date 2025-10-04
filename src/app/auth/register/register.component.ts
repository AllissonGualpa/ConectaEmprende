import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputFieldComponent } from '../../shared/components/input-field/input-field.component';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';
import { GenderSelectorComponent } from '../../shared/components/gender-selector/gender-selector.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    InputFieldComponent,
    PasswordInputComponent,
    GenderSelectorComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        fecha: ['', Validators.required],
        genero: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  //Getters para simplificar el HTML
  get nombre() {
    return this.registerForm.get('nombre')!;
  }

  get apellido() {
    return this.registerForm.get('apellido')!;
  }

  get fecha() {
    return this.registerForm.get('fecha')!;
  }

  get genero() {
    return this.registerForm.get('genero')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  //Validación comparar contraseñas
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onRegister() {
    if (this.registerForm.valid) {
      console.log('Registro exitoso:', this.registerForm.value);
      //lógica para crear usuario
    } else {
      console.log('Formulario inválido');
      this.registerForm.markAllAsTouched();
    }
  }
}