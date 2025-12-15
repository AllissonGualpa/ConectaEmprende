import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';
import { EmprendimientoService, EmprendimientosFilter } from '../../emprendimiento.service';
import { Environment } from '../../../../environments/environment';

@Component({
  selector: 'app-startups',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    CardsComponent,
  ],
  templateUrl: './startups.component.html',
  styleUrls: ['./startups.component.css'],
})
export class StartupsComponent implements OnInit {
  cardsArray: CardItem[] = [];
  filteredCards: CardItem[] = [];
  loading = true;

  // Datos del backend
  ciudades: any[] = [];
  categorias: any[] = [];

  // Filtros dinámicos
  searchFilters: any[] = [];

  private apiCategorias = Environment.api_url + Environment.api_categorias;
  private apiCiudades = Environment.api_url + Environment.api_ciudades;

  constructor(
    private emprendimientoService: EmprendimientoService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFiltersAndData();
  }

  /**
   * Cargar ciudades, categorías y startups en paralelo
   */
  loadFiltersAndData() {
    this.loading = true;

    forkJoin({
      ciudades: this.http.get<any[]>(this.apiCiudades).pipe(
        catchError((err) => {
          console.error('Error al cargar ciudades:', err);
          return of([]);
        })
      ),
      categorias: this.http.get<any[]>(this.apiCategorias).pipe(
        catchError((err) => {
          console.error('Error al cargar categorías:', err);
          return of([]);
        })
      ),
    }).subscribe({
      next: ({ ciudades, categorias }) => {
        this.ciudades = ciudades;
        this.categorias = categorias;
        this.buildSearchFilters();
        this.fetchStartups({ tipo: 'STARTUP' });
      },
      error: (err) => {
        console.error('Error inesperado al cargar filtros:', err);
        this.buildSearchFilters();
        this.fetchStartups({ tipo: 'STARTUP' });
      },
    });
  }

  /**
   * Construir los filtros dinámicamente con los datos del backend
   */
  buildSearchFilters() {
    this.searchFilters = [
      {
        key: 'category',
        label: 'Categoría',
        options: this.categorias.map((cat) => cat.nombre),
      },
      {
        key: 'location',
        label: 'Ubicación',
        options: this.ciudades.map(
          (c) => `${c.nombreCiudad} (${c.provincia?.nombre || 'Sin provincia'})`
        ),
      },
      {
        key: 'type',
        label: 'Tipo',
        options: ['Producto', 'Servicio'],
      },
    ];
  }

  /**
   * Cargar las startups desde el servicio.
   * Filtra solo los de tipoEmprendimientoId = 1 o 3 (Startups)
   */
  fetchStartups(filters?: EmprendimientosFilter) {
    this.loading = true;

    this.emprendimientoService.getEmprendimientos(filters).subscribe({
      next: (response) => {
        console.log('Datos recibidos:', response);

        // Manejar respuesta paginada o array directo
        let data: any[];
        if (response?.content && Array.isArray(response.content)) {
          data = response.content;
        } else if (Array.isArray(response)) {
          data = response;
        } else {
          console.warn('Formato inesperado de datos:', response);
          this.cardsArray = [];
          this.filteredCards = [];
          this.loading = false;
          return;
        }

        // Filtrar las startups (id 1 y 3)
        const startups = data.filter(
          (e) =>
            (e.tipoEmprendimientoId === 1 || e.tipoEmprendimientoId === 3) &&
            e.estadoEmprendimiento === 'APROBADO'
        );

        console.log('Startups filtradas:', startups.length);

        // Mapear a formato de tarjetas
        this.cardsArray = startups.map((e) => ({
          id: e.id,
          title: e.nombreComercial || 'Startup sin nombre',
          description: `${e.nombreTipoEmprendimiento?.trim() || 'Tipo desconocido'} aprobada en ${e.nombreCiudad || 'sin ciudad'}`,
          image: '/assets/img/inicio/foto5.png',
          category: e.nombreTipoEmprendimiento?.trim() || 'Startup',
          location: e.nombreCiudad || 'Sin ubicación',
          views: Math.floor(Math.random() * 20000) + 1000,
        }));

        this.filteredCards = [...this.cardsArray];
        console.log('Cards mapeadas:', this.filteredCards.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar startups:', err);
        this.cardsArray = [];
        this.filteredCards = [];
        this.loading = false;
      },
    });
  }

  // Filtro de búsqueda - llama al backend con los filtros
  onSearch(payload: { query: string; [key: string]: any }) {
    const filters: EmprendimientosFilter = {
      tipo: 'STARTUP',
    };

    if (payload.query?.trim()) {
      filters.nombre = payload.query.trim();
    }
    if (payload['category']) {
      filters.categoria = payload['category'];
    }
    if (payload['location']) {
      // Extraer solo el nombre de la ciudad (sin la provincia entre paréntesis)
      const locationValue = payload['location'];
      const cityName = locationValue.split(' (')[0];
      filters.ciudad = cityName;
    }

    this.fetchStartups(filters);
  }

  // ⚙️ Acciones
  onDiscover(item: CardItem) {
    console.log('Descubrir startup:', item);
    this.router.navigate(['/startups', item.id]);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
