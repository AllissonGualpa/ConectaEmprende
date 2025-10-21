import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  articulo: any = null;
  cargando = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const data = this.route.snapshot.queryParamMap.get('data');
    if (data) {
      this.articulo = JSON.parse(decodeURIComponent(data));
      this.cargando = false;
    } else {
      this.error = 'Artículo no encontrado';
      this.cargando = false;
    }
  }

  volverAlBlog() {
    this.router.navigate(['/blog']);
  }
}
