import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  getEmailErrorMessage() {
    if (this.email.hasError('required')) {
      return 'El correo electrónico es obligatorio';
    }
    return this.email.hasError('email') ? 'Ingresa un correo válido' : '';
  }

  getPasswordErrorMessage() {
    return this.password.hasError('required') ? 'La contraseña es obligatoria' : '';
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          localStorage.setItem('token', response.jwtToken);

          // Redirección según usuario
          if (email === 'sofia@email.com' && password === 'sofia123') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/inicio']);
          }
        },
        error: (err) => {
          console.error('Error al iniciar sesión:', err);
          alert('Credenciales incorrectas o error del servidor.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
