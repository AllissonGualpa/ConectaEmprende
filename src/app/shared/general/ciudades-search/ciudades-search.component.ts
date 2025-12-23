import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedGeneralService } from '../shared-general.service';
import { Ciudad } from '../shared-general.types';

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
  ]
})
export class CiudadesSearchComponent implements OnInit, OnChanges {
  @Input() placeholder: string = 'Seleccionar ciudad';
  @Input() required: boolean = false;
  @Input() provinciaId: number | null = null;
  @Output() ciudadSelected = new EventEmitter<Ciudad | null>();

  ciudadControl = new FormControl<Ciudad | null>({ value: null, disabled: true });
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];

  constructor(private readonly sharedGeneralService: SharedGeneralService) {}

  ngOnInit(): void {
    this.loadCiudades();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['provinciaId']) {
      console.log('🔄 Cambió provinciaId:', this.provinciaId);
      this.filterByProvincia();
      
      if (this.provinciaId) {
        this.ciudadControl.enable();
      } else {
        this.ciudadControl.disable();
      }
      
      if (changes['provinciaId'].currentValue !== changes['provinciaId'].previousValue) {
        this.ciudadControl.setValue(null);
        this.ciudadSelected.emit(null);
      }
    }
  }

  loadCiudades(): void {
    this.sharedGeneralService.getCiudades().subscribe({
      next: (ciudades) => {
        console.log('✅ Ciudades cargadas:', ciudades);
        this.ciudades = ciudades;
        this.filterByProvincia();
      },
      error: (error) => {
        console.error('❌ Error al cargar ciudades:', error);
      }
    });
  }

  filterByProvincia(): void {
    if (this.provinciaId) {
      this.ciudadesFiltradas = this.ciudades.filter(
        ciudad => ciudad.provincia?.id === this.provinciaId
      );
      console.log(`🏙️ Ciudades filtradas (${this.ciudadesFiltradas.length}):`, this.ciudadesFiltradas);
    } else {
      this.ciudadesFiltradas = [];
    }
  }

  // 👇 Función para comparar objetos Ciudad
  compareCiudades(c1: Ciudad, c2: Ciudad): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  onCiudadSelected(ciudad: Ciudad): void {
    console.log('✅ Ciudad seleccionada:', ciudad);
    this.ciudadSelected.emit(ciudad);
  }

  clear(): void {
    this.ciudadControl.setValue(null);
    this.ciudadSelected.emit(null);
  }
}