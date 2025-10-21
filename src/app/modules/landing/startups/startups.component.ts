import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../../layout/cards/cards.component';

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
  styleUrl: './startups.component.css',
})
export class StartupsComponent {
  // búsqueda
  onSearch(payload: { query: string; [key: string]: any }) {
    console.log('Búsqueda en Startups:', payload);
  }

  // tarjetas de ejemplo
  cardsArray: CardItem[] = [
    {
      id: 1,
      title: 'Abuela Churros',
      description:
        'En Abuela Churros ofrecemos churros artesanales elaborados al momento con ingredientes frescos y de la mejor calidad.',
      image: '/assets/img/inicio/foto5.png',
      category: 'Alimentos y Bebidas',
      location: 'Guayaquil',
      views: 20000,
    },
    {
      id: 2,
      title: 'GreenTech',
      description:
        'Soluciones tecnológicas sostenibles para empresas que buscan reducir su huella ambiental.',
      image: '/assets/img/inicio/foto5.png',
      category: 'Tecnología',
      location: 'Quito',
      views: 18500,
    },
    {
      id: 3,
      title: 'FitLife App',
      description:
        'Aplicación móvil para crear rutinas personalizadas de ejercicio y alimentación saludable.',
      image: '/assets/img/inicio/foto5.png',
      category: 'Salud y Bienestar',
      location: 'Cuenca',
      views: 21000,
    },
    {
      id: 4,
      title: 'EduConnect',
      description:
        'Plataforma que conecta mentores con estudiantes interesados en tecnología y emprendimiento.',
      image: '/assets/img/inicio/foto5.png',
      category: 'Educación',
      location: 'Guayaquil',
      views: 17000,
    },
  ];

  // acciones emitidas
  onDiscover(item: CardItem) {
    console.log('Descubrir startup:', item);
  }

  onToggleFavorite(item: CardItem) {
    console.log('Favorito cambiado:', item);
  }
}
