import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../modules/auth/auth.service';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-admin.component.html',
  styleUrls: ['./navbar-admin.component.css']
})
export class NavbarAdminComponent {
  user: { name: string; role: string } = {
    name: '',
    role: ''
  };

  // Menú dinámico
  menuItems = [
    {
      nombre: 'Dashboard',
      enlace: '/admin',
      icono: 'analytics' as const
    },
    {
      nombre: 'Solicitudes',
      enlace: '/admin/solicitudes',
      icono: 'solicitudes' as const
    },
    {
      nombre: 'Emprendimientos',
      enlace: '/admin/emprendimientos',
      icono: 'emprendimientos' as const
    },
    {
      nombre: 'Autoevaluación',
      enlace: '/admin/autoevaluacion',
      icono: 'autoevaluacion' as const
    },
    {
      nombre: 'Eventos',
      enlace: '/admin/evento',
      icono: 'eventos' as const
    },
    {
      nombre: 'Blog',
      enlace: '/admin/blog',
      icono: 'blog' as const
    }
  ];

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

    this.router.navigate(['/inicio']).then(() => {
      window.history.pushState(null, '', '/login');
      window.onpopstate = () => {
        window.history.pushState(null, '', '/login');
      };
    });
  }
}
