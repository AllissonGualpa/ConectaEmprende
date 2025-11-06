import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent, SearchPayload } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent } from '../../../layout/cards/cards.component';
import { Router } from '@angular/router';
import { BlogService } from '../../admin/blog.service';

interface BlogArticulo {
  idArticulo: number;
  titulo: string;
  descripcionCorta: string;
  urlImagen?: string;
  tags?: { idTag: number; nombre: string }[];
  fechaCreacion: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    CardsComponent
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

  constructor(private router: Router, private blogService: BlogService) { }

  ngOnInit(): void {
    this.cargarTags();
    this.cargarArticulos();
  }

  // Cargar tags desde API
  cargarTags() {
    this.blogService.getAllTags().subscribe({
      next: (data) => {
        this.tagsArray = data.map((tag: { idTag: number; nombre: string }) => tag.nombre);
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        this.tagsArray = [];
      }
    });
  }

  // Cargar artículos del blog
  cargarArticulos() {
    this.blogService.getPublicArticles({ fechaInicio: '2024-06-01T00:00:00', page: 0, size: 10 }).subscribe({
      next: (response) => {
        const data = response.content;
        if (Array.isArray(data)) {
          this.articulosOriginales = data;
          this.blogCardsArrayOriginal = data.map((item: BlogArticulo) => ({
            id: item.idArticulo,
            title: item.titulo,
            description: item.descripcionCorta,
            image: item.urlImagen || '/assets/img/blog/default.jpg',
            tags: item.tags?.map((t: { idTag: number; nombre: string }) => t.nombre) || [],
            date: new Date(item.fechaCreacion).toLocaleDateString('es-EC', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
          }));
          this.blogCardsArray = [...this.blogCardsArrayOriginal];
          this.error = null;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.error = 'La respuesta del servidor no es válida.';
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar artículos:', err);
        if (err.status === 401) {
          const token = localStorage.getItem('token');
          this.error = token
            ? 'Tu sesión ha expirado o el token no es válido.'
            : 'Se requiere autenticación para ver los artículos (por ahora).';
        } else {
          this.error = 'No se pudieron cargar los artículos. Inténtalo más tarde.';
        }
        this.cargando = false;
      }
    });
  }

  abrirDetalle(card: any) {
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

  // Filtrar artículos por búsqueda y tag
  onSearch(payload: SearchPayload) {
    const { query, filters } = payload;
    let filtered = [...this.blogCardsArrayOriginal];

    if (query) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(query.toLowerCase())
      );
    }

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

    this.blogCardsArray = filtered;
  }
}
