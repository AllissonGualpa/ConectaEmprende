import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { Environment } from '../../../../environments/environment';

@Component({
  selector: 'app-startups-detail',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './startups-detail.component.html',
  styleUrls: ['./startups-detail.component.css']
})
export class StartupsDetailComponent implements OnInit {
  startup: any = null;
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchStartupDetail(id);
    } else {
      this.error = true;
      this.errorMessage = 'ID de startup no válido';
      this.loading = false;
    }
  }

  /**
   * Carga el detalle de la startup desde la lista general de emprendimientos.
   */
  fetchStartupDetail(id: string) {
    const url = Environment.api_url + Environment.api_emprendimientos;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        // Manejar respuesta paginada o array directo
        let data: any[];
        if (response?.content && Array.isArray(response.content)) {
          data = response.content;
        } else if (Array.isArray(response)) {
          data = response;
        } else {
          console.warn('Formato inesperado de datos:', response);
          this.error = true;
          this.errorMessage = 'Formato de datos inesperado';
          this.loading = false;
          return;
        }

        // Buscar la startup por ID
        const found = data.find(e => e.id.toString() === id);

        if (found) {
          // Verificar que sea tipo "startup"
          const tipo = found.nombreTipoEmprendimiento?.toLowerCase() || '';
          if (tipo.includes('startup')) {
            this.startup = found;
            this.error = false;
          } else {
            this.error = true;
            this.errorMessage = 'Este emprendimiento no es una startup';
          }
        } else {
          this.error = true;
          this.errorMessage = 'Startup no encontrada';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar lista de emprendimientos:', err);
        this.error = true;
        this.errorMessage = 'Error al cargar la información de la startup';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/startups']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
