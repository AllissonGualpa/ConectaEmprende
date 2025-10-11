import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface SearchPayload {
  query: string;
  category?: string;
  location?: string;
  type?: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<SearchPayload>();

  form: FormGroup;

  //plantilla!! se puede reemplazar estos arrays por datos reales o inputs
  categories = ['Arte y cultura', 'Salud y Bienestar', 'Tecnología', 'Moda', 'Alimentos'];
  locations = ['Quito', 'Guayaquil', 'Cuenca', 'Loja'];
  types = ['Producto', 'Servicio', 'Evento'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      query: [''],
      category: [''],
      location: [''],
      type: ['']
    });
  }

  submit() {
    if (!this.form) return;
    const payload: SearchPayload = {
      query: this.form.value.query?.trim() ?? '',
      category: this.form.value.category || '',
      location: this.form.value.location || '',
      type: this.form.value.type || ''
    };
    this.search.emit(payload);
  }

  clear() {
    this.form.reset();
    this.submit();
  }
}