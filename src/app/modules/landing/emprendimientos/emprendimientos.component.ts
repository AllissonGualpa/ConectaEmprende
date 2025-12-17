import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';
import { EmprendimientoService, EmprendimientosFilter } from '../../emprendimiento.service';
import { Environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emprendimientos',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    CardsComponent,
  ],
  templateUrl: './emprendimientos.component.html',
  styleUrls: ['./emprendimientos.component.css'],
})
export class EmprendimientosComponent implements OnInit {
  cardsArray: CardItem[] = [];
  filteredCards: CardItem[] = [];
  loading = true;

  // Datos del backend
  ciudades: any[] = [];
  categorias: any[] = [];

  // Filtros dinámicos
  searchFilters: any[] = [];

  // Categoría obtenida de la ruta
  categoriaFromRoute: string | null = null;
  initialSearchValues: any = {};

  private apiCategorias = Environment.api_url + Environment.api_categorias;
  private apiCiudades = Environment.api_url + Environment.api_ciudades;

  constructor(
    private emprendimientoService: EmprendimientoService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Leer el parámetro de la ruta antes de cargar filtros
    this.route.queryParamMap.subscribe(params => {
      this.categoriaFromRoute = params.get('categoria');
      this.loadFiltersAndData();
    });
  }

  /**
   * Cargar ciudades, categorías y emprendimientos en paralelo
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

        // Si hay categoría en la ruta, setear valor inicial y buscar
        if (this.categoriaFromRoute) {
          this.initialSearchValues = { category: this.categoriaFromRoute };
          this.fetchEmprendimientos({ tipo: 'EMPRENDIMIENTO', categoria: this.categoriaFromRoute });
        } else {
          this.initialSearchValues = {};
          this.fetchEmprendimientos({ tipo: 'EMPRENDIMIENTO' });
        }
      },
      error: (err) => {
        console.error('Error inesperado al cargar filtros:', err);
        this.buildSearchFilters();
        this.fetchEmprendimientos({ tipo: 'EMPRENDIMIENTO' });
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
   * Cargar los emprendimientos desde el servicio.
   * Filtra solo los de tipoEmprendimientoId = 2 o 4 (Servicios y Productos)
   */
  fetchEmprendimientos(filters?: EmprendimientosFilter) {
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

        // Filtrar los emprendimientos (id 2 y 4)
        const emprendimientos = data.filter(
          (e) =>
            (e.tipoEmprendimientoId === 2 || e.tipoEmprendimientoId === 4) &&
            e.estadoEmprendimiento === 'APROBADO'
        );

        console.log('Emprendimientos filtrados:', emprendimientos.length);

        // Mapear a formato de tarjetas
        this.cardsArray = emprendimientos.map((e) => ({
          id: e.id,
          title: e.nombreComercial || 'Emprendimiento sin nombre',
          description: `${e.nombreTipoEmprendimiento?.trim() || 'Tipo desconocido'} aprobado en ${e.nombreCiudad || 'sin ciudad'}`,
          image: '/assets/img/inicio/foto5.png',
          category: e.nombreTipoEmprendimiento?.trim() || 'Emprendimiento',
          location: e.nombreCiudad || 'Sin ubicación',
          views: Math.floor(Math.random() * 20000) + 1000,
        }));

        this.filteredCards = [...this.cardsArray];
        console.log('Cards mapeadas:', this.filteredCards.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos:', err);
        this.cardsArray = [];
        this.filteredCards = [];
        this.loading = false;
      },
    });
  }

  // Filtro de búsqueda - llama al backend con los filtros
  onSearch(payload: { query: string; [key: string]: any }) {
    const filters: EmprendimientosFilter = {
      tipo: 'EMPRENDIMIENTO',
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

    this.fetchEmprendimientos(filters);
  }

  // Acciones
  onDiscover(item: CardItem) {
    // navegar a la ruta de detalle agregando el id al final de la ruta actual
    this.router.navigate([item.id], { relativeTo: this.route });
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
