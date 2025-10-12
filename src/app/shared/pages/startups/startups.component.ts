import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-startups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './startups.component.html',
  styleUrl: './startups.component.css'
})
export class StartupsComponent {
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedSubCategory: string = '';
  selectedRating: string = '';

  // Datos de ejemplo para los filtros
  categories: string[] = [
    'Alimentos y bebidas',
    'Tecnología',
    'Moda y Accesorios',
    'Salud y Bienestar',
    'Educación',
    'Servicios'
  ];

  subCategories: string[] = [
    'Productos orgánicos',
    'Software',
    'Ropa',
    'Belleza',
    'Cursos online',
    'Consultoría'
  ];

  ratings: string[] = [
    '5 estrellas',
    '4 estrellas o más',
    '3 estrellas o más'
  ];

  onSearch() {
    console.log('Searching with:', {
      searchTerm: this.searchTerm,
      category: this.selectedCategory,
      subCategory: this.selectedSubCategory,
      rating: this.selectedRating
    });
    // Aquí integrarás la llamada a tu API cuando esté lista
  }
}