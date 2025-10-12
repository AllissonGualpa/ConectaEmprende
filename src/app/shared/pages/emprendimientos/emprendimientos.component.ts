import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../components/cards/cards.component'; 

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
    console.log('Búsqueda en Emprendimientos:', payload);
    // Aquí puedes:
    // - llamar a un servicio para filtrar resultados
    // - navegar a una página de resultados con query params
    // - aplicar los filtros en el estado del componente
    
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

}
