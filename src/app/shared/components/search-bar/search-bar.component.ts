import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';


export interface SearchPayload {
  query: string;
  [key: string]: any;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  @Output() search = new EventEmitter<SearchPayload>();

  // dynamic filters: array of { key,label,options } no agregar nada aqui si no en el html por ejemplo el key date (plantilla)
  @Input() filters: Array<{ key: string; label: string; options?: string[] }> = [
    { key: 'category', label: 'Categoria', options: ['Arte y cultura', 'Salud y Bienestar', 'Tecnología'] },
    { key: 'location', label: 'Ubicación', options: ['Quito', 'Guayaquil', 'Cuenca'] },
    { key: 'type', label: 'Tipo', options: ['Producto', 'Servicio', 'Evento'] }
  ];

  @Input() labelQuery = 'Buscar por nombre o tipo';
  @Input() containerClass = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  form: FormGroup = this.fb.group({ query: [''] });

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // add controls for dynamic filters
    this.filters.forEach((f) => {
      if (!this.form.contains(f.key)) {
        this.form.addControl(f.key, this.fb.control(''));
      }
    });
  }

  submit() {
    if (!this.form) return;
    const values = this.form.value;
    const payload: SearchPayload = { query: values.query?.trim() ?? '' };
    // include dynamic filter values by key
    this.filters.forEach((f) => {
      payload[f.key] = values[f.key] || '';
    });
    this.search.emit(payload);
  }

  clear() {
    this.form.reset();
    this.submit();
  }
}