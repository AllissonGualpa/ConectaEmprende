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
  styleUrl: './startups.component.css',
})
export class StartupsComponent implements OnInit {
  cardsArray: CardItem[] = [];
  allStartups: any[] = [];
  loading = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchStartups();
  }

  fetchStartups() {
    const endpoint = 'https://eureka-emprende.onrender.com/api/emprendimientos/filtrar?tipo=Startup';

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        // Mapear los resultados al formato usado por las tarjetas
        this.cardsArray = data.map((s) => ({
          id: s.id,
          title: s.nombreComercial || 'Startup sin nombre',
          description:
            s.estadoEmprendimiento === 'APROBADO'
              ? `Startup aprobada ubicada en ${s.nombreCiudad}`
              : 'Emprendimiento en proceso.',
          image: '/assets/img/inicio/foto5.png', // temporal mientras no haya imagen real
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


  // Búsqueda (filtro por nombre o tipo)
  onSearch(payload: { query: string;[key: string]: any }) {
    const query = payload.query?.toLowerCase() || '';

    this.cardsArray = this.allStartups.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
    );
  }

  // Acciones emitidas desde las tarjetas
  onDiscover(item: CardItem) {
    console.log('Descubrir startup:', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
