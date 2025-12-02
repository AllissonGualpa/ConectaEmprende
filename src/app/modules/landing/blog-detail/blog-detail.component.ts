import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService, BlogArticle } from '../../admin/blog.service';
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

  // contenido HTML saneado para mostrar en la vista
  contenidoSeguro: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarArticulo(Number(id));
    } else {
      this.error = 'Artículo no encontrado.';
      this.cargando = false;
    }
  }

  private cargarArticulo(id: number): void {
    this.blogService.getPublicArticleById(id).subscribe({
      next: (data: BlogArticle) => {
        this.articulo = {
          ...data,
          fechaPublicacion: this.blogService.formatDisplayDate(data.fechaCreacion)
        };

        // Marcar el contenido como HTML seguro
        this.contenidoSeguro = this.sanitizer.bypassSecurityTrustHtml(
          this.articulo.contenido || ''
        );

        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el artículo:', err);
        this.error = 'No se pudo cargar el artículo.';
        this.cargando = false;
      }
    });
  }

  volverAlBlog(): void {
    this.router.navigate(['/blog']);
  }
}