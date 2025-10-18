import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CardsComponent, CardItem } from '../../components/cards/cards.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, SearchBarComponent, CardsComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  blogCardsArray: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.blogCardsArray = [
      {
        id: 1,
        title: 'Cómo preparar tu pitch para inversionistas',
        description: 'Claves para estructurar una presentación clara, convincente y profesional.',
        image: '/assets/img/blog/blog1.png',
        tags: ['Pitch', 'Inversión', 'Startups'],
        date: '24-08-2025'
      },
      {
        id: 2,
        title: 'Cómo organizar tus finanzas desde el primer día',
        description: 'Aprende estrategias simples para manejar ingresos, gastos y proyecciones.',
        image: '/assets/img/blog/blog2.png',
        tags: ['Consejos', 'Finanzas', 'Emprendedores'],
        date: '23-08-2025'
      },
      {
        id: 3,
        title: '5 formas de dar visibilidad a tu negocio',
        description: 'Descubre tácticas efectivas para que más personas conozcan lo que haces.',
        image: '/assets/img/blog/blog3.png',
        tags: ['Marketing', 'Estrategia', 'Crecimiento'],
        date: '23-08-2025'
      },
      {
        id: 4,
        title: 'Tendencias tech que debes conocer en 2025',
        description: 'Un repaso de las innovaciones tecnológicas que marcarán el futuro.',
        image: '/assets/img/blog/blog4.png',
        tags: ['Innovación', 'Tecnología', 'Escalabilidad'],
        date: '21-08-2025'
      },
      {
        id: 5,
        title: 'Cómo fijar precios sin perder clientes',
        description: 'Descubre métodos sencillos para calcular el valor de tus productos.',
        image: '/assets/img/blog/blog5.png',
        tags: ['Precios', 'Ventas', 'Emprendedores'],
        date: '19-08-2025'
      },
      {
        id: 6,
        title: 'Redes sociales: tu vitrina digital',
        description: 'Aprende a usar Instagram, TikTok y Facebook para tu negocio.',
        image: '/assets/img/blog/blog6.png',
        tags: ['Digital', 'Estrategia', 'Marketing'],
        date: '19-08-2025'
      },
      {
        id: 7,
        title: 'Validando tu idea antes de lanzarla',
        description: 'Evita perder tiempo y recursos validando si tu idea resuelve un problema real.',
        image: '/assets/img/blog/blog7.png',
        tags: ['Innovación', 'Lean Startup', 'Startups'],
        date: '19-08-2025'
      },
      {
        id: 8,
        title: 'Cómo armar tu equipo fundador',
        description: 'El talento correcto puede marcar la diferencia.',
        image: '/assets/img/blog/equipo.jpg',
        tags: ['Equipo', 'Startups', 'Liderazgo'],
        date: '19-08-2025'
      },
      {
        id: 9,
        title: 'Primeros pasos para conseguir inversión',
        description: 'Guía práctica para preparar tu startup y levantar capital.',
        image: '/assets/img/blog/inversion.jpg',
        tags: ['Inversión', 'Pitch', 'Crecimiento'],
        date: '19-08-2025'
      },
      {
        id: 10,
        title: 'Escalar sin perder el control',
        description: 'Aprende a crecer de forma sostenible manteniendo tu cultura.',
        image: '/assets/img/blog/escalar.jpg',
        tags: ['Cultura', 'Escalabilidad'],
        date: '19-08-2025'
      }
    ];
  }

  abrirDetalle(card: any) {
    // Aquí se redigirá a /blog/:id
    alert(`Abrir detalle del blog: ${card.title}`);
  }

  onSearch(payload: { query: string; [key: string]: any }) {
    console.log('Búsqueda en Blog:', payload);
  }
}
