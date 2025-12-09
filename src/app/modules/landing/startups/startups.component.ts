import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';
import { Router } from '@angular/router';
import { Environment } from '../../../../environments/environment';

@Component({
  selector: 'app-startups',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    CardsComponent,
  ],
  templateUrl: './startups.component.html',
  styleUrls: ['./startups.component.css'],
})
export class StartupsComponent implements OnInit {
  // Declarar la propiedad antes de usarla en el template
  categories: string[] = [];

  cardsArray: CardItem[] = [];
  allStartups: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.fetchCategories();
    this.fetchStartups();
  }

  // Cargar categorías desde el endpoint
  fetchCategories() {
    const endpoint = Environment.api_url + Environment.api_categorias;
    const token = localStorage.getItem('token');

    // Si no hay token, salimos directamente
    if (!token) {
      console.warn('No se encontró token. No se pueden cargar las categorías.');
      this.categories = [];
      return;
    }

    // Cabeceras correctamente tipadas
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(endpoint, { headers }).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.categories = data.map((c: any) => c.nombre || 'Sin nombre');
        } else {
          console.warn('Formato inesperado de categorías:', data);
          this.categories = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.categories = [];
      },
    });
  }

  // Cargar startups
  fetchStartups() {
    const endpoint = Environment.api_url + Environment.api_emprendimientos + '/filtrar';

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          console.warn('Formato inesperado de datos:', data);
          this.cardsArray = [];
          this.loading = false;
          return;
        }

        // Filtramos solo las startups
        const startups = data.filter(
          (s) => s.tipoEmprendimientoId === 1 && s.estadoEmprendimiento === 'APROBADO'
        );

        // Mapeamos al formato de las tarjetas
        this.cardsArray = startups.map((s) => ({
          id: s.id,
          title: s.nombreComercial || 'Startup sin nombre',
          description: `Startup aprobada ubicada en ${s.nombreCiudad || 'sin ciudad'}`,
          image: '/assets/img/inicio/foto5.png',
          category: s.nombreTipoEmprendimiento?.trim() || 'Startup',
          location: s.nombreCiudad || 'Sin ubicación',
          views: Math.floor(Math.random() * 20000) + 1000,
        }));

        this.allStartups = this.cardsArray;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar startups:', err);
        this.loading = false;
      },
    });
  }


  // Filtro de búsqueda
  onSearch(payload: { query: string;[key: string]: any }) {
    const query = payload.query?.toLowerCase() || '';
    const selectedCategory = payload['category'] || '';
    this.cardsArray = this.allStartups.filter((s) => {
      const matchesQuery =
        s.title.toLowerCase().includes(query) || s.category.toLowerCase().includes(query);
      const matchesCategory =
        !selectedCategory || s.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }

  // Acciones
  onDiscover(item: CardItem) {
    // Navegar al detalle de la startup con su id
    if (item && item.id) {
      this.router.navigate(['/startups', item.id]);
    } else {
      console.warn('Item sin id, no se puede navegar al detalle:', item);
    }
  }

  onToggleFavorite(item: CardItem) {
    console.log('Toggle favorito:', item);
  }
}
