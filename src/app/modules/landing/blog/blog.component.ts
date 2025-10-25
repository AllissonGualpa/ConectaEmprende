import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent, SearchPayload } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent } from '../../../layout/cards/cards.component';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface BlogArticulo {
  idArticulo: number;
  titulo: string;
  descripcionCorta: string;
  contenido: string;
  urlImagen?: string;
  tags?: { idTag: number; nombre: string }[];
  fechaCreacion: string;
  estado: string;
  archivado?: boolean;
}

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
  tagsArray: string[] = [];

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarTags();
    this.cargarArticulos();
  }

  cargarTags() {
    const url = 'https://eureka-emprende.onrender.com/v1/blog/tags';
    this.http.get<{ nombre: string }[]>(url).subscribe({
      next: (data) => {
        this.tagsArray = data.map(tag => tag.nombre);
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        this.tagsArray = [];
      }
    });
  }

  cargarArticulos() {
    const url =
      'https://eureka-emprende.onrender.com/v1/blog/articulos?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59';

    const token = localStorage.getItem('token');
    let options: any = { responseType: 'json', observe: 'body' as const };
    if (token) {
      options.headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    this.http.get<BlogArticulo[]>(url, options).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          // filtrar solo publicados y no archivados
          this.blogCardsArray = data
            .filter(item => item.estado.toUpperCase() === 'PUBLICADO' && !item.archivado)
            .map((item) => ({
              id: item.idArticulo,
              title: item.titulo,
              description: item.descripcionCorta,
              image: item.urlImagen || '/assets/img/blog/default.jpg',
              tags: item.tags?.map((t: { idTag: number; nombre: string }) => t.nombre) || [],
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
        if (err.status === 401 && !token) {
          this.error = null; // usuario no logueado, no mostrar error
        } else {
          this.error =
            err.status === 401
              ? 'No tienes autorización para ver los artículos. Inicia sesión primero.'
              : 'No se pudieron cargar los artículos. Inténtalo más tarde.';
        }
        this.cargando = false;
      }
    });
  }

  abrirDetalle(card: any) {
    const articuloData = encodeURIComponent(JSON.stringify(card));
    this.router.navigate(['/blog', card.id], { queryParams: { data: articuloData } });
  }

  onSearch(payload: SearchPayload) {
    console.log('Búsqueda en Blog:', payload);
  }
}
