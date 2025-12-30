import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedGeneralService } from '../shared-general.service';
import { Ciudad, Provincia } from '../shared-general.types';

@Component({
  selector: 'app-ciudades-search',
  templateUrl: './ciudades-search.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CiudadesSearchComponent),
    multi: true
  }]
})
export class CiudadesSearchComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() placeholder: string = 'Seleccionar ciudad';
  @Input() required: boolean = false;
  @Input() provincia: Provincia | null = null;
  @Output() ciudadSelected = new EventEmitter<Ciudad | null>();

  ciudadControl = new FormControl<Ciudad | null>({ value: null, disabled: true });
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];

  private onChange: Function = () => { };
  private onTouched: Function = () => { };
  private ciudadPendiente: Ciudad | null = null; // ✅ Guardar ciudad pendiente

  get provinciaId(): number | null {
    return this.provincia?.id || null;
  }

  constructor(private readonly sharedGeneralService: SharedGeneralService) {}

  ngOnInit(): void {
    this.loadCiudades();
    
    if (this.required) {
      this.ciudadControl.setValidators([Validators.required]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['provincia']) {
      const provinciaActual = changes['provincia'].currentValue;
      const provinciaAnterior = changes['provincia'].previousValue;
      
      console.log('🔄 [CIUDAD] Cambió provincia:', provinciaActual);
      
      this.filterByProvincia();
      
      if (this.provincia) {
        this.ciudadControl.enable();
        
        // ✅ Si hay ciudad pendiente y ahora tenemos provincia, intentar asignarla
        if (this.ciudadPendiente) {
          console.log('🔄 [CIUDAD] Intentando asignar ciudad pendiente:', this.ciudadPendiente);
          setTimeout(() => this.trySetCiudad(this.ciudadPendiente!), 100);
        }
      } else {
        this.ciudadControl.disable();
        this.ciudadControl.setValue(null);
        this.onChange(null);
        this.ciudadSelected.emit(null);
      }
      
      // Limpiar ciudad solo si cambió la provincia (no en la carga inicial)
      if (provinciaAnterior && provinciaActual && provinciaAnterior.id !== provinciaActual.id) {
        console.log('🗑️ [CIUDAD] Limpiando ciudad por cambio de provincia');
        this.ciudadControl.setValue(null);
        this.onChange(null);
        this.ciudadSelected.emit(null);
        this.ciudadPendiente = null;
      }
    }
  }

  loadCiudades(): void {
    this.sharedGeneralService.getCiudades().subscribe({
      next: (ciudades) => {
        console.log('✅ [CIUDAD] Ciudades cargadas:', ciudades.length);
        this.ciudades = ciudades;
        this.filterByProvincia();
        
        // ✅ Después de cargar, intentar asignar ciudad pendiente
        if (this.ciudadPendiente && this.provincia) {
          setTimeout(() => this.trySetCiudad(this.ciudadPendiente!), 50);
        }
      },
      error: (error) => {
        console.error('❌ [CIUDAD] Error al cargar ciudades:', error);
      }
    });
  }

  filterByProvincia(): void {
    if (this.provincia?.id) {
      this.ciudadesFiltradas = this.ciudades.filter(
        ciudad => ciudad.provincia?.id === this.provincia!.id
      );
      console.log(`🏙️ [CIUDAD] Ciudades filtradas (${this.ciudadesFiltradas.length}) para provincia ${this.provincia.nombre}`);
    } else {
      this.ciudadesFiltradas = [];
      console.log('🏙️ [CIUDAD] Sin provincia seleccionada, ciudades vacías');
    }
  }

  // ✅ Método mejorado para intentar asignar ciudad
  private trySetCiudad(ciudad: Ciudad): void {
    if (!ciudad) {
      this.ciudadPendiente = null;
      return;
    }

    const ciudadExiste = this.ciudadesFiltradas.find(c => c.id === ciudad.id);
    
    if (ciudadExiste) {
      this.ciudadControl.setValue(ciudad, { emitEvent: false });
      this.ciudadPendiente = null;
      console.log('✅ [CIUDAD] Ciudad asignada correctamente:', ciudad.nombreCiudad);
    } else {
      console.warn('⚠️ [CIUDAD] Ciudad no encontrada en lista filtrada');
      console.log('Ciudad buscada:', ciudad);
      console.log('Ciudades disponibles:', this.ciudadesFiltradas);
    }
  }

  compareCiudades(c1: Ciudad, c2: Ciudad): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  onCiudadSelected(ciudad: Ciudad | null): void {
    console.log('✅ [CIUDAD] Ciudad seleccionada:', ciudad);
    this.onChange(ciudad);
    this.ciudadSelected.emit(ciudad);
  }

  clear(): void {
    console.log('🗑️ [CIUDAD] Limpiando selección');
    this.ciudadControl.setValue(null);
    this.onChange(null);
    this.ciudadSelected.emit(null);
    this.ciudadPendiente = null;
  }

  // ==========================================
  // Implementación de ControlValueAccessor
  // ==========================================

  writeValue(value: Ciudad | null): void {
    console.log('📝 [CIUDAD] writeValue llamado con:', value);
    
    if (value) {
      // ✅ Guardar como pendiente y intentar asignar
      this.ciudadPendiente = value;
      
      // Si ya tenemos provincia y ciudades cargadas, asignar inmediatamente
      if (this.provincia && this.ciudadesFiltradas.length > 0) {
        this.trySetCiudad(value);
      } else {
        console.log('⏳ [CIUDAD] Guardando ciudad como pendiente hasta que cargue provincia');
      }
    } else {
      this.ciudadControl.setValue(null, { emitEvent: false });
      this.ciudadPendiente = null;
    }
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.ciudadControl.disable();
    } else if (this.provincia) {
      this.ciudadControl.enable();
    }
  }
}