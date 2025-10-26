import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';

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

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchCategories();
    this.fetchStartups();
  }

  // Cargar categorías desde el endpoint
  fetchCategories() {
  const endpoint = 'https://eureka-emprende.onrender.com/v1/categorias';
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
    const endpoint = 'https://eureka-emprende.onrender.com/api/emprendimientos/filtrar?tipo=Startup';

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        this.cardsArray = data.map((s) => ({
          id: s.id,
          title: s.nombreComercial || 'Startup sin nombre',
          description:
            s.estadoEmprendimiento === 'APROBADO'
              ? `Startup aprobada ubicada en ${s.nombreCiudad}`
              : 'Emprendimiento en proceso.',
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
    console.log('Descubrir startup:', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
