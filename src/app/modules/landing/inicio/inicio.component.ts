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

interface CategoriaDestacada {
  nombre: string;
  imagen: string;
  link: string;
  imagenCargada?: boolean;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, MatButtonModule, MatIconModule],
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements OnInit {
  isLoggedIn: boolean = false;
  loading: boolean = true;
  categoriasDestacadas: CategoriaDestacada[] = [];

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
            link: `/landing/emprendimientos?categoria=${encodeURIComponent(cat.nombre)}`,
            imagenCargada: false
          }));
          
          // Precargar imágenes
          this.precargarImagenes();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar categorías destacadas:', err);
          this.categoriasDestacadas = [];
          this.loading = false;
        }
      });
    }
  }

  /**
   * Precarga las imágenes para mejorar la experiencia del usuario
   */
  private precargarImagenes(): void {
    this.categoriasDestacadas.forEach((cat, index) => {
      const img = new Image();
      img.onload = () => {
        cat.imagenCargada = true;
      };
      img.onerror = () => {
        console.warn(`Error al cargar imagen: ${cat.imagen}`);
        // Usar imagen por defecto si falla
        cat.imagen = '/assets/img/inicio/foto1.jpg';
        cat.imagenCargada = true;
      };
      img.src = cat.imagen;
    });
  }

  /**
   * Método para manejar errores de carga de imagen
   */
  onImageError(event: any, categoria: CategoriaDestacada): void {
    console.warn(`Imagen fallida: ${categoria.imagen}`);
    categoria.imagen = '/assets/img/inicio/foto1.jpg';
    event.target.src = categoria.imagen;
  }
}