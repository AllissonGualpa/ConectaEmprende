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
  tagsOptions: { label: string; value: number }[] = [];

  // 🔹 Variables para la paginación
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  // 🔹 Variables para búsqueda y filtros
  currentQuery = '';
  currentTag: string = '';

  constructor(private router: Router, private blogService: BlogService) { }

  ngOnInit(): void {
    this.cargarTags();
    this.cargarArticulos();
  }

  // Cargar tags desde API
  cargarTags() {
    this.blogService.getAllTags().subscribe({
      next: (data) => {
        this.tagsOptions = data.map((tag: { idTag: number; nombre: string }) => ({
          label: tag.nombre,
          value: tag.idTag
        }));
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        this.tagsOptions = [];
      }
    });
  }

  // Cargar artículos paginados con búsqueda y filtros
  cargarArticulos(page: number = 0, query: string = this.currentQuery, tag: string = this.currentTag) {
    this.cargando = true;

    const params: any = { fechaInicio: '2024-06-01T00:00:00', page, size: this.pageSize};
    if (query) params.query = query;
    if (tag) params.idTag = tag;

    this.blogService
      .getPublicArticles(params)
      .subscribe({
        next: (response) => {
          const data = response.content || [];

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

          // Adaptar a tu backend
          const pageable = response.pageable || {};
          const totalElements = pageable.length || data.length || 0;
          const size = pageable.size || this.pageSize;

          this.currentPage = pageable.page || 0;
          this.totalPages = Math.ceil(totalElements / size) || 1;

          this.error = null;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar artículos:', err);
          this.error = 'No se pudieron cargar los artículos. Inténtalo más tarde.';
          this.cargando = false;
        }
      });
  }


  // Ir a la página anterior
  paginaAnterior() {
    if (this.currentPage > 0) {
      this.cargarArticulos(this.currentPage - 1);
    }
  }

  // Ir a la página siguiente
  siguientePagina() {
    if (this.currentPage + 1 < this.totalPages) {
      this.cargarArticulos(this.currentPage + 1);
    }
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

  // Filtrar artículos por búsqueda y tag (ahora del lado del servidor)
  onSearch(payload: SearchPayload) {
    const { query, tag } = payload;
    this.currentQuery = query || '';
    this.currentTag = tag || '';
    this.cargarArticulos(0); // Resetear a página 0 al buscar
  }
}
