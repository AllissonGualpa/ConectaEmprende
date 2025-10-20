import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../components/cards/cards.component'; 


@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, SearchBarComponent, CardsComponent],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent {

  //SEARCH BAR
   onSearch(payload: { query: string; [key: string]: any }) {
    console.log('Búsqueda en Emprendimientos:', payload);
    // Aquí puedes:
    // - llamar a un servicio para filtrar resultados
    // - navegar a una página de resultados con query params
    // - aplicar los filtros en el estado del componente
    // Build filtered result from cardsArray
    let result = this.cardsArray.slice();

    // Query text filter
    const q = payload.query?.trim()?.toLowerCase();
    if (q) {
      result = result.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }

    // Date filter: payload['date'] is 'YYYY-MM-DD'
    if (payload['date']) {
      const payloadDate: string = payload['date'];
      result = result.filter(item => {
        if (!item.date) return false;
        let itemDateStr = '';
        if (typeof item.date === 'string') {
          itemDateStr = item.date;
        } else if (item.date instanceof Date) {
          itemDateStr = item.date.toISOString().slice(0, 10);
        } else {
          itemDateStr = new Date(item.date).toISOString().slice(0, 10);
        }
        return itemDateStr === payloadDate;
      });
    }

    // Location filter
    if (payload['location']) {
      result = result.filter(i => i.location === payload['location']);
    }

    // assign
    this.filtered = result;
    
    
  }

  //CARDS
  cardsArray: CardItem[] = [
    { id: 1, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-04-12' },
    { id: 2, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-05-03' },
    { id: 3, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-06-21' },
    { id: 4, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-07-08' },
    { id: 5, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-08-16' },
    { id: 6, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-09-05' },
    { id: 7, title: 'WORKSHOP: INTELIGENCIA ARTIFICIAL PARA STARTUPS', description: 'Esto es un texto para que vaya  pequeña descripción del evento', image: '/assets/img/eventos/foto1.png', date: '2025-09-05' },
    // ...mas items EJEMPLOS son 6 por pagina 
  ];

  // filtered list (initially all items)
  filtered: CardItem[] = this.cardsArray.slice(); // copia inicial de items

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

    // handler para el botón Registrarse en eventos
    onRegister(item: CardItem) {
      console.log('Registrarse en evento:', item);
      // implementar lógica de registro (abrir modal, navegar, llamar API, etc.)
    }
}
