import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-evaluacion',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './evaluacion.component.html'
})
export class EvaluacionComponent {

  ratings = [1, 2, 3, 4, 5];

  selected: any = {
    calidad: null,
    empaque: null,
    funcionalidad: null,
    precio: null,
    recomendacion: null
  };

  setRating(field: string, value: number) {
    this.selected[field] = value;
  }

  submit() {
    console.log('Resultados:', this.selected);
  }
}