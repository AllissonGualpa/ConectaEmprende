import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarAdminComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  user = {
    name: '',
    role: ''
  };

  stats = {
    totalUsers: 0,
    emprendimientos: 0,
    totalVisits: 0
  };

  // quiero una variable genero que llega de el perfil
  genero: string | null = null;

  get saludo(): string {
    // Ajusta los posibles valores de genero según tu backend
    const g = (this.genero || '').toLowerCase();
    if (g === 'femenino' || g === 'f' || g === 'mujer') {
      return 'Bienvenida';
    }
    // por defecto masculino / neutro
    return 'Bienvenido';
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const perfil = this.authService.getPerfilLocal();

    this.user = {
      name: perfil?.nombreCompleto || perfil?.nombre || 'Usuario',
      role: perfil?.nombreRol || perfil?.rol || 'Sin rol'
    };

    // leer genero desde el perfil (ajusta el nombre del campo si es distinto)
    this.genero = perfil?.genero || perfil?.sexo || null;

    this.stats = {
      totalUsers: perfil?.totalUsuarios || this.stats.totalUsers,
      emprendimientos: perfil?.totalEmprendimientos || this.stats.emprendimientos,
      totalVisits: perfil?.totalVisitas || this.stats.totalVisits
    };
  }
}
