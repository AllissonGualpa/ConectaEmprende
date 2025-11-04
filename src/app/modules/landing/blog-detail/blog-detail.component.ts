import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule, NavbarComponent, FooterComponent],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  articulo: any = null;
  cargando = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`https://eureka-emprende.onrender.com/v1/blog/publico/articulos/${id}`)
        .subscribe({
          next: (data: any) => {
            this.articulo = data;
            this.articulo.fechaPublicacion = this.formatearFecha(this.articulo.fechaCreacion);
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al cargar el artículo:', err);
            this.error = 'No se pudo cargar el artículo.';
            this.cargando = false;
          }
        });
    } else {
      this.error = 'Artículo no encontrado.';
      this.cargando = false;
    }
  }

  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  volverAlBlog() {
    this.router.navigate(['/blog']);
  }
}
