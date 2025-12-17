// all-emprendimiento-selector.component.ts
import { Component, OnInit, Output, EventEmitter, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmprendimientoService } from '../../modules/emprendimiento.service';

export interface Emprendimiento {
  id: number;
  nombreComercial: string;
}

@Component({
  selector: 'app-all-emprendimiento-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './all-emprendimiento-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AllEmprendimientoSelectorComponent),
      multi: true
    }
  ]
})
export class AllEmprendimientoSelectorComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = 'Seleccionar Emprendimiento';
  @Input() placeholder: string = 'Seleccione un emprendimiento';
  @Input() required: boolean = false;
  @Input() filters?: {
    nombre?: string;
    tipo?: string;
    categoria?: string;
    ciudad?: string;
  };
  @Output() emprendimientoSelected = new EventEmitter<number>();

  emprendimientoControl = new FormControl();
  emprendimientos: Emprendimiento[] = [];
  filteredEmprendimientos: Emprendimiento[] = [];
  searchText: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  disabled: boolean = false;

  constructor(private emprendimientoService: EmprendimientoService) {}

  ngOnInit(): void {
    this.loadEmprendimientos();
  }

  private loadEmprendimientos(): void {
    this.isLoading = true;
    this.error = null;

    const params = {
      page: 0,
      size: 100,
      ...this.filters
    };

    this.emprendimientoService.getEmprendimientos(params).subscribe({
      next: (response) => {
        let items: Emprendimiento[] = [];
        
        // Manejar diferentes estructuras de respuesta
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.content && Array.isArray(response.content)) {
          items = response.content;
        } else if (response?.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response?.result && Array.isArray(response.result)) {
          items = response.result;
        }

        // Normalizar los datos
        this.emprendimientos = items.map(item => ({
          id: item.id,
          nombreComercial: item.nombreComercial || 'Sin nombre'
        }));

        this.filteredEmprendimientos = [...this.emprendimientos];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando emprendimientos:', err);
        this.error = 'Error al cargar los emprendimientos';
        this.isLoading = false;
        this.emprendimientos = [];
        this.filteredEmprendimientos = [];
      }
    });
  }

  filterEmprendimientos(searchText: string): void {
    this.searchText = searchText;
    
    if (!searchText || searchText.trim() === '') {
      this.filteredEmprendimientos = [...this.emprendimientos];
      return;
    }

    const filterValue = searchText.toLowerCase().trim();
    this.filteredEmprendimientos = this.emprendimientos.filter(emp =>
      emp.nombreComercial.toLowerCase().includes(filterValue)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredEmprendimientos = [...this.emprendimientos];
  }

  onEmprendimientoSelected(idEmprendimiento: number): void {
    if (idEmprendimiento) {
      this.onChange(idEmprendimiento);
      this.emprendimientoSelected.emit(idEmprendimiento);
      this.onTouched();
      this.clearSearch();
    }
  }

  clearSelection(): void {
    this.emprendimientoControl.setValue(null);
    this.onChange(null);
    this.emprendimientoSelected.emit(null as any);
    this.onTouched();
    this.clearSearch();
  }

  getEmprendimientoName(id: number): string {
    const emprendimiento = this.emprendimientos.find(e => e.id === id);
    return emprendimiento ? emprendimiento.nombreComercial : '';
  }

  reload(newFilters?: any): void {
    if (newFilters) {
      this.filters = newFilters;
    }
    this.loadEmprendimientos();
  }

  // ControlValueAccessor methods
  writeValue(value: number | null): void {
    if (value !== null && value !== undefined) {
      this.emprendimientoControl.setValue(value, { emitEvent: false });
    } else {
      this.emprendimientoControl.setValue(null, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.emprendimientoControl.disable();
    } else {
      this.emprendimientoControl.enable();
    }
  }
}