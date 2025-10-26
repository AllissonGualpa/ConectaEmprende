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
  blogCardsArrayOriginal: any[] = [];
  blogCardsArray: any[] = [];
  articulosOriginales: BlogArticulo[] = [];
  cargando = true;
  error: string | null = null;
  tagsArray: string[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTags();
    this.cargarArticulos();
  }

  // Cargar tags desde API
  cargarTags() {
    const url = 'https://eureka-emprende.onrender.com/v1/blog/tags';
    const token = localStorage.getItem('token');

    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.get<{ idTag: number; nombre: string }[]>(url, { headers }).subscribe({
      next: (data) => {
        this.tagsArray = data.map(tag => tag.nombre);
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        this.tagsArray = [];
      }
    });
  }

  // Cargar artículos del blog
  cargarArticulos() {
    const url =
      'https://eureka-emprende.onrender.com/v1/blog/articulos?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59';

    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    this.http.get<BlogArticulo[]>(url, { headers }).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.articulosOriginales = data.filter(
            item => item.estado.toUpperCase() === 'PUBLICADO' && !item.archivado
          );

          // Transformamos para la vista
          this.blogCardsArrayOriginal = this.articulosOriginales.map(item => ({
            id: item.idArticulo,
            title: item.titulo,
            description: item.descripcionCorta,
            image: item.urlImagen || '/assets/img/blog/default.jpg',
            tags: item.tags?.map(t => t.nombre) || [],
            date: new Date(item.fechaCreacion).toLocaleDateString('es-EC', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }),
            contenido: item.contenido
          }));

          // Inicializamos el array visible
          this.blogCardsArray = [...this.blogCardsArrayOriginal];
        } else {
          console.warn('Formato de respuesta inesperado:', data);
          this.error = 'La respuesta del servidor no es válida.';
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar artículos:', err);
        if (err.status === 401 && !token) {
          this.error = null;
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
    // Buscamos el artículo original completo usando el ID
    const articuloCompleto = this.articulosOriginales.find(
      art => art.idArticulo === card.id
    );

    if (articuloCompleto) {
      const articuloData = encodeURIComponent(JSON.stringify(articuloCompleto));
      this.router.navigate(['/blog', card.id], { queryParams: { data: articuloData } });
    } else {
      console.error('No se encontró el artículo original');
    }
  }

  // Búsqueda funcional: texto y tags
  onSearch(payload: SearchPayload) {
    const { query, filters } = payload;
    let filtered = [...this.blogCardsArrayOriginal];

    // Filtrar por texto en título
    if (query) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filtrar por tags seleccionados
    if (filters) {
      filters.forEach((filter: { key: string; value: any }) => {
        if (filter.key === 'tag') {
          filtered = filtered.filter(card => {
            const filterValue =
              typeof filter.value === 'string' ? filter.value : filter.value?.label;
            return card.tags.includes(filterValue);
          });
        }
      });
    }

    // Actualizar array visible
    this.blogCardsArray = filtered;
  }
}