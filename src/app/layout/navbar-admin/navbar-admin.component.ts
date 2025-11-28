import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../modules/auth/auth.service';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-admin.component.html',
  styleUrls: ['./navbar-admin.component.css']
})
export class NavbarAdminComponent {
  user: { name: string; role: string } = {
    name: '',
    role: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    const perfil = this.authService.getPerfilLocal();
    if (perfil) {
      // Ajusta estas propiedades según la estructura real del perfil guardado
      this.user = {
        name: `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`.trim(),
        role: perfil.nombreRol ?? perfil.role ?? 'Usuario'
      };
    } else {
      // Opcional: valores por defecto si no hay perfil
      this.user = {
        name: 'Usuario',
        role: 'Usuario'
      };
    }
  }

  logout() {
    // Usar AuthService para centralizar la lógica
    this.authService.logout();

    this.router.navigate(['/login']).then(() => {
      window.history.pushState(null, '', '/login');
      window.onpopstate = () => {
        window.history.pushState(null, '', '/login');
      };
    });
  }
}
