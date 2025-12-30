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
import { EmprendimientoService } from '../../core/services/emprendimiento.service';
export interface Emprendimiento {
  nombreEmprendimiento: string;
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
  @Output() emprendimientoSelected = new EventEmitter<string>();

  emprendimientoControl = new FormControl();
  emprendimientos: Emprendimiento[] = [];
  filteredEmprendimientos: Emprendimiento[] = [];
  searchText: string = '';
  isLoading: boolean = false;
  error: string | null = null;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  disabled: boolean = false;

  constructor(private emprendimientoService: EmprendimientoService) {}

  ngOnInit(): void {
    this.loadEmprendimientos();
  }

  private loadEmprendimientos(): void {
    this.isLoading = true;
    this.error = null;

    this.emprendimientoService.getListaEmprendimientos().subscribe({
      next: (response) => {
        this.emprendimientos = response || [];
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
      emp.nombreEmprendimiento.toLowerCase().includes(filterValue)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredEmprendimientos = [...this.emprendimientos];
  }

  onEmprendimientoSelected(nombreEmprendimiento: string): void {
    if (nombreEmprendimiento) {
      this.onChange(nombreEmprendimiento);
      this.emprendimientoSelected.emit(nombreEmprendimiento);
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

  reload(): void {
    this.loadEmprendimientos();
  }

  // ControlValueAccessor methods
  writeValue(value: string | null): void {
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