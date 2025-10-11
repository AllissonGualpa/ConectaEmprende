import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component'; 

@Component({
  selector: 'app-emprendimientos',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, SearchBarComponent],
  templateUrl: './emprendimientos.component.html',
  styleUrl: './emprendimientos.component.css'
})
export class EmprendimientosComponent {
  onSearch(payload: { query: string; category?: string; location?: string; type?: string }) {
    console.log('Búsqueda recibida en Inicio:', payload);
    // Aquí puedes:
    // - navegar a una ruta de resultados,
    // - llamar a un servicio para filtrar datos,
    // - actualizar el estado de la página con los filtros, etc.
  }
}
