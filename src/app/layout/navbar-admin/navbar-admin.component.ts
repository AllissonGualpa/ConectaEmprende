import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-admin.component.html',
  styleUrls: ['./navbar-admin.component.css']
})
export class NavbarAdminComponent {
  user = {
    name: 'Sofía Marifé',
    role: 'Administrador'
  };

  constructor(private router: Router) {}

  logout() {
    // Eliminar token o cualquier dato de sesión
    localStorage.removeItem('token');
    sessionStorage.clear();

    // Navegar al login
    this.router.navigate(['/login']).then(() => {
      // Reemplazar historial para evitar volver atrás
      window.history.pushState(null, '', '/login');
      window.onpopstate = () => {
        window.history.pushState(null, '', '/login');
      };
    });
  }
}
