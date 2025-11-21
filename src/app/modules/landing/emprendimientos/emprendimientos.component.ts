import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';
import { Environment } from '../../../../environments/environment';

@Component({
  selector: 'app-emprendimientos',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchEmprendimientos();
  }

  /**
   * Cargar los emprendimientos desde el nuevo endpoint.
   * Filtra solo los de tipoEmprendimientoId = 2 o 4 (Servicios y Productos)
   */
  fetchEmprendimientos() {
    const endpoint = Environment.api_url+Environment.api_emprendimientos+'/filtrar';

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          console.warn('Formato inesperado de datos:', data);
          this.cardsArray = [];
          this.loading = false;
          return;
        }

        // Filtrar los emprendimientos (id 2 y 4)
        const emprendimientos = data.filter(
          (e) =>
            (e.tipoEmprendimientoId === 2 || e.tipoEmprendimientoId === 4) &&
            e.estadoEmprendimiento === 'APROBADO'
        );

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

        this.filteredCards = this.cardsArray;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos:', err);
        this.loading = false;
      },
    });
  }

  // Filtro de búsqueda
  onSearch(payload: { query: string; [key: string]: any }) {
    const q = (payload.query || '').toLowerCase().trim();
    const category = ((payload as any)['category'] || '').toLowerCase();
    const location = ((payload as any)['location'] || '').toLowerCase();
    const type = ((payload as any)['type'] || '').toLowerCase();

    this.filteredCards = this.cardsArray.filter((c) => {
      const cat = (c.category || '').toLowerCase();
      const loc = (c.location || '').toLowerCase();

      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        cat.includes(q);

      const matchCategory = !category || cat.includes(category);
      const matchLocation = !location || loc.includes(location);
      const matchType = !type || cat.includes(type);

      return matchQuery && matchCategory && matchLocation && matchType;
    });
  }

  // ⚙️ Acciones
  onDiscover(item: CardItem) {
    console.log('Descubrir emprendimiento:', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
