import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogArticle, BlogService } from '../../../core/services/blog.service';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {

  articulo: BlogArticle | null = null;
  cargando = true;
  error: string | null = null;

  contenidoSeguro: SafeHtml | null = null;

  articulosRelacionados: BlogArticle[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // ESCUCHAR CAMBIO DE ID
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.cargando = true;
        this.cargarArticulo(id);
      }
    });
  }

  private cargarArticulo(id: number): void {
    this.blogService.getPublicArticleById(id).subscribe({
      next: (data: BlogArticle) => {
        this.articulo = {
          ...data,
          fechaPublicacion: this.blogService.formatDisplayDate(data.fechaCreacion)
        };

        this.contenidoSeguro = this.sanitizer.bypassSecurityTrustHtml(
          this.articulo.contenido || ''
        );

        this.cargarArticulosRelacionados(id);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el artículo.';
        this.cargando = false;
      }
    });
  }

  private cargarArticulosRelacionados(idActual: number): void {
    this.blogService.getPublicArticles({ page: 0, size: 50 }).subscribe({
      next: (response: any) => {
        this.articulosRelacionados = (response.content || [])
          .filter((a: BlogArticle) => a.idArticulo !== idActual)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
      },
      error: () => {
        this.articulosRelacionados = [];
      }
    });
  }

  abrirDetalle(articulo: BlogArticle): void {
    this.router.navigate(['/blog', articulo.idArticulo]);
  }

  volverAlBlog(): void {
    this.router.navigate(['/blog']);
  }
}