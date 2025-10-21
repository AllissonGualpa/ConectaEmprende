import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component'; 

@Component({
  selector: 'app-emprendimientos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, SearchBarComponent, CardsComponent],
  templateUrl: './emprendimientos.component.html',
  styleUrl: './emprendimientos.component.css'
})
export class EmprendimientosComponent {

  //SEARCH BAR
   onSearch(payload: { query: string; [key: string]: any }) {
    // payload puede contener: { query, category, location, type }
    const q = (payload.query || '').toLowerCase().trim();
  const category = ((payload as any)['category'] || '').toLowerCase();
  const location = ((payload as any)['location'] || '').toLowerCase();
  const type = ((payload as any)['type'] || '').toLowerCase();

    this.filteredCards = this.cardsArray.filter(c => {
      const matchQuery = !q || (
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        String(c.id).toLowerCase().includes(q)
      );

      const matchCategory = !category || (c.category || '').toLowerCase().includes(category);
      const matchLocation = !location || (c.location || '').toLowerCase().includes(location);
      // Note: 'type' isn't a field on CardItem by default; if you store it in description or category, adjust accordingly
      const matchType = !type || (c.description || '').toLowerCase().includes(type) || (c.category || '').toLowerCase().includes(type);

      return matchQuery && matchCategory && matchLocation && matchType;
    });
    // reset pagination in cards component if needed
    
  }

  //CARDS
  cardsArray: CardItem[] = [
    { id: 1, title: 'Abuela Churros', description: 'Churros artesanales...', image: '/assets/img/inicio/foto5.png', category: 'Alimentos y Bebidas', location: 'Guayaquil', views: 20000 },
    { id: 2, title: 'Taller Creativo', description: 'Taller de cerámica...', image: '/assets/img/inicio/foto5.png', category: 'Arte y cultura', location: 'Quito', views: 12000 },
    { id: 3, title: 'Tech Solutions', description: 'Servicios de desarrollo...', image: '/assets/img/inicio/foto5.png', category: 'Tecnología', location: 'Cuenca', views: 15000 },
    { id: 4, title: 'Yoga Vida', description: 'Clases de yoga y bienestar...', image: '/assets/img/inicio/foto5.png', category: 'Salud y Bienestar', location: 'Quito', views: 8000 },
    { id: 5, title: 'EcoMarket', description: 'Productos ecológicos...', image: '/assets/img/inicio/foto5.png', category: 'Alimentos y Bebidas', location: 'Guayaquil', views: 9500 },
    { id: 6, title: 'Arte Urbano', description: 'Galería de arte contemporáneo...', image: '/assets/img/inicio/foto5.png', category: 'Arte y cultura', location: 'Cuenca', views: 11000 },
    // ...mas items EJEMPLOS
  ];

  filteredCards: CardItem[] = [];

  // manejadores emitidos por <app-cards>
  onDiscover(item: CardItem) {
    console.log('Descubrir item:', item);
    // por ejemplo: navegar a detalle
    // this.router.navigate(['/emprendimiento', item.id]);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Toggle favorito:', item);
    // lógica para marcar favorito (llamar API o cambiar estado local)
  }

  ngOnInit(): void {
    // initialize filtered list
    this.filteredCards = this.cardsArray.slice();
  }

}
