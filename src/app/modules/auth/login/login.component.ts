import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

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
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
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

      this.loading = true;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.jwtToken);

          // Obtener perfil desde el backend y redirigir según rol
          this.authService.getPerfil().subscribe({
            next: (perfil) => {
              const rol = perfil?.nombreRol;

              if (rol === 'ADMINISTRADOR') {
                this.router.navigate(['/admin']).finally(() => {
                  this.loading = false;
                });
              } else {
                this.router.navigate(['/inicio']).finally(() => {
                  this.loading = false;
                });
              }
            },
            error: (errPerfil) => {
              console.error('Error al obtener el perfil:', errPerfil);
              // En caso de error al traer el perfil, lo enviamos a inicio por defecto
              this.router.navigate(['/inicio']).finally(() => {
                this.loading = false;
              });
            }
          });
        },
        error: (err) => {
          console.error('Error al iniciar sesión:', err);
          this.loading = false;

          this.dialog.open(MensajeConfirmacionComponent, {
            width: '380px',
            data: {
              type: 'error',
              title: 'Error al iniciar sesión',
              subtitle: 'Credenciales incorrectas o error del servidor.'
            }
          });
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
