import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent } from '../../../layout/cards/cards.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    CardsComponent,
    HttpClientModule
  ],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  blogCardsArray: any[] = [];
  cargando = true;
  error: string | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarArticulos();
  }

  cargarArticulos() {
    const url =
      'https://eureka-emprende.onrender.com/v1/blog/articulos?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59';

    const token = localStorage.getItem('token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http
      .get<any[]>(url, { headers, responseType: 'json', observe: 'body' })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.blogCardsArray = data.map((item: any) => ({
              id: item.idArticulo,
              title: item.titulo,
              description: item.descripcionCorta,
              image: item.urlImagen || '/assets/img/blog/default.jpg',
              tags: item.tags?.map((t: any) => t.nombre) || [],
              date: new Date(item.fechaCreacion).toLocaleDateString('es-EC', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }),
              contenido: item.contenido
            }));
          } else {
            console.warn('Formato de respuesta inesperado:', data);
            this.error = 'La respuesta del servidor no es válida.';
          }

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar artículos:', err);
          this.error =
            err.status === 401
              ? 'No tienes autorización para ver los artículos. Inicia sesión primero.'
              : 'No se pudieron cargar los artículos. Inténtalo más tarde.';
          this.cargando = false;
        }
      });
  }

  abrirDetalle(card: any) {
    // Pasamos todo el artículo al componente detalle como query param
    const articuloData = encodeURIComponent(JSON.stringify(card));
    this.router.navigate(['/blog', card.id], { queryParams: { data: articuloData } });
  }

  onSearch(payload: { query: string; [key: string]: any }) {
    console.log('Búsqueda en Blog:', payload);
  }
}
