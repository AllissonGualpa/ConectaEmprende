import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { trigger, state, style, animate, transition } from '@angular/animations';

export interface SearchPayload {
  query: string;
  [key: string]: any;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatFormFieldModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('250ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ]
})
export class SearchBarComponent implements OnInit, OnDestroy, OnChanges {
  @Output() search = new EventEmitter<SearchPayload>();

  // dynamic filters: array of { key,label,options } no agregar nada aqui si no en el html por ejemplo el key date (plantilla)
  @Input() filters: Array<{ key: string; label: string; options?: any[] }> = [
    { key: 'category', label: 'Categoria', options: ['Arte y cultura', 'Salud y Bienestar', 'Tecnología'] },
    { key: 'location', label: 'Ubicación', options: ['Quito', 'Guayaquil', 'Cuenca'] },
    { key: 'type', label: 'Tipo', options: ['Producto', 'Servicio', 'Evento'] },
  ];

  @Input() labelQuery = 'Buscar por nombre o tipo';
  @Input() containerClass = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  @Input() initialValues: any;

  form: FormGroup = this.fb.group({ query: [''] });
  private sub?: Subscription;
  showMobileFilters = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // add controls for dynamic filters
    this.filters.forEach((f) => {
      if (!this.form.contains(f.key)) {
        this.form.addControl(f.key, this.fb.control(''));
      }
    });

    // Set initial values if provided
    if (this.initialValues) {
      this.form.patchValue(this.initialValues, { emitEvent: false });
    }

    this.sub = this.form.valueChanges.pipe(debounceTime(250)).subscribe(() => this.submit());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues'] && this.initialValues) {
      // Set initial values when input changes
      this.form.patchValue(this.initialValues, { emitEvent: false });
    }
  }

  submit() {
    if (!this.form) return;
    const values = this.form.value;
    const payload: SearchPayload = { query: values.query?.trim() ?? '' };
    // include dynamic filter values by key
    this.filters.forEach((f) => {
      const val = values[f.key];
      if (f.key === 'date' && val) {
        // mat-datepicker may return Date object; normalize to YYYY-MM-DD
        const d = val instanceof Date ? val : new Date(val);
        const iso = d.toISOString().slice(0, 10);
        payload[f.key] = iso;
      } else {
        payload[f.key] = val || '';
      }
    });
    console.log('SearchBar submit payload:', payload);
    this.search.emit(payload);
  }

  clear() {
    this.form.reset();
    this.submit();
  }

  // Métodos para manejar opciones (string u objeto)
  getOptionValue(opt: any): any {
    return typeof opt === 'string' ? opt : opt.value;
  }

  getOptionLabel(opt: any): string {
    return typeof opt === 'string' ? opt : opt.label;
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}