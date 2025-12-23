import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, MatButtonModule, MatIconModule],
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements OnInit {
  isLoggedIn: boolean = false;
  loading: boolean = true;

  // Cards dinámicos de categorías destacadas
  categoriasDestacadas: any[] = [];

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
 const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
    });

    this.loading = true;
    // Cargar categorías desde API
    this.http.get<any[]>(environment.api_url + environment.api_categorias).subscribe({
      next: (categorias) => {
        this.categoriasDestacadas = categorias.map(cat => ({
          nombre: cat.nombre,
          imagen: cat.urlImagen || '/assets/img/inicio/foto1.jpg',
          link: `/landing/emprendimientos?categoria=${encodeURIComponent(cat.nombre)}`
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar categorías destacadas:', err);
        this.categoriasDestacadas = [];
        this.loading = false;
      }
    });    // resto de tu lógica...
  }
  
  }
}
