import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, MatButtonModule, MatIconModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  isLoggedIn: boolean = false;

  // Cards dinámicos de categorías destacadas
  categoriasDestacadas: any[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Ajusta esta lógica según tu mecanismo de auth real
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // Cargar categorías desde API
    this.http.get<any[]>('http://eureka.osc-fr1.scalingo.io/v1/categorias').subscribe({
      next: (categorias) => {
        this.categoriasDestacadas = categorias.map(cat => ({
          nombre: cat.nombre,
          imagen: cat.urlImagen || '/assets/img/inicio/foto1.jpg',
          anchura: 'normal',
          link: `/landing/emprendimientos?categoria=${encodeURIComponent(cat.nombre)}`
        }));
      },
      error: (err) => {
        console.error('Error al cargar categorías destacadas:', err);
        this.categoriasDestacadas = [];
      }
    });
  }
}
