import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';

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
  styleUrl: './emprendimientos.component.css',
})
export class EmprendimientosComponent implements OnInit {
  cardsArray: CardItem[] = [];
  filteredCards: CardItem[] = [];
  loading = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchEmprendimientos();
  }

  // Obtener los emprendimientos
  fetchEmprendimientos() {
    const endpoint = 'https://eureka-emprende.onrender.com/api/emprendimientos/filtrar?tipo=Emprendimiento';

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        // Mapeamos los resultados al formato de las tarjetas
        this.cardsArray = data.map((e) => ({
          id: e.id,
          title: e.nombreComercial || 'Emprendimiento sin nombre',
          description:
            e.estadoEmprendimiento === 'APROBADO'
              ? `${e.nombreTipoEmprendimiento?.trim() || 'Tipo desconocido'} aprobado en ${e.nombreCiudad}`
              : 'Emprendimiento en proceso.',
          image: '/assets/img/inicio/foto5.png', // imagen temporal
          category: e.nombreTipoEmprendimiento?.trim() || 'Emprendimiento',
          location: e.nombreCiudad || 'Sin ubicación',
          views: Math.floor(Math.random() * 20000) + 1000,
        }));

        // Inicializamos la lista filtrada
        this.filteredCards = this.cardsArray;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos:', err);
        this.loading = false;
      },
    });
  }

  // Filtros de búsqueda (nombre, categoría, ubicación, tipo)
  onSearch(payload: { query: string;[key: string]: any }) {
    const q = (payload.query || '').toLowerCase().trim();
    const category = ((payload as any)['category'] || '').toLowerCase();
    const location = ((payload as any)['location'] || '').toLowerCase();
    const type = ((payload as any)['type'] || '').toLowerCase();

    this.filteredCards = this.cardsArray.filter(c => {
      const matchQuery =
        !q ||
        (c.title?.toLowerCase().includes(q)) ||
        (c.description?.toLowerCase().includes(q)) ||
        (c.category?.toLowerCase().includes(q)) ||
        String(c.id).toLowerCase().includes(q);

      const matchCategory =
        !category || (c.category?.toLowerCase().includes(category));

      const matchLocation =
        !location || (c.location?.toLowerCase().includes(location));

      const matchType =
        !type ||
        (c.description?.toLowerCase().includes(type)) ||
        (c.category?.toLowerCase().includes(type));

      return matchQuery && matchCategory && matchLocation && matchType;
    });
  }


  // Acciones desde las tarjetas
  onDiscover(item: CardItem) {
    console.log('Descubrir emprendimiento:', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
