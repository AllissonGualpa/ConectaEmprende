import { Component, OnInit, Output, EventEmitter, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';

export interface Emprendimiento {
	id: number;
	nombreComercialEmprendimiento: string;
	estadoEmprendimiento?: string;
}

@Component({
	selector: 'app-emprendimiento-selector',
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
	templateUrl: './emprendimiento-selector.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => EmprendimientoSelectorComponent),
			multi: true
		}
	]
})
export class EmprendimientoSelectorComponent implements OnInit, ControlValueAccessor {
	@Input() label: string = 'Seleccionar Emprendimiento';
	@Input() placeholder: string = 'Seleccione un emprendimiento';
	@Input() required: boolean = false;
	@Output() emprendimientoSelected = new EventEmitter<number>();

	emprendimientoControl = new FormControl();
	emprendimientos: Emprendimiento[] = [];
	filteredEmprendimientos: Emprendimiento[] = [];
	searchText: string = '';
	isLoading: boolean = false;
	error: string | null = null;

	private onChange: (value: number | null) => void = () => { };
	private onTouched: () => void = () => { };
	disabled: boolean = false;

	constructor(
		private emprendimientoService: EmprendimientoService,
		private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		this.loadEmprendimientos();
		
		// Sincronizar cambios del control interno con el formulario padre
		this.emprendimientoControl.valueChanges.subscribe(value => {
			console.log('🔄 Valor del control cambió:', value);
		});
	}

	private loadEmprendimientos(): void {
		this.isLoading = true;
		this.error = null;

		console.log('📡 Iniciando carga de emprendimientos...');

		this.emprendimientoService.obtenerMisEmprendimientos(0, 100).subscribe({
			next: (response) => {
				console.log('✅ Respuesta recibida:', response);
				
				const emprendimientosData = response.content || [];
				console.log('📦 Datos de emprendimientos:', emprendimientosData);

				// Filtrar solo los emprendimientos APROBADOS o PUBLICADOS
				this.emprendimientos = emprendimientosData
					.filter((emp: any) => {
						const estado = emp.estadoEmprendimiento;
						const esValido = estado === 'APROBADO' || estado === 'PUBLICADO';
						console.log(`🔍 ${emp.nombreComercialEmprendimiento} - Estado: ${estado} - Válido: ${esValido}`);
						return esValido;
					})
					.map((emp: any) => ({
						id: emp.idEmprendimiento,
						nombreComercialEmprendimiento: emp.nombreComercialEmprendimiento,
						estadoEmprendimiento: emp.estadoEmprendimiento
					}));

				this.filteredEmprendimientos = [...this.emprendimientos];
				this.isLoading = false;

				console.log('✨ Emprendimientos cargados y filtrados:', this.emprendimientos);
				console.log(`📊 Total disponibles: ${this.emprendimientos.length}`);

				// Aplicar validadores después de cargar
				this.updateValidators();
				
				// Forzar detección de cambios para que Angular Material renderice las opciones
				this.cdr.detectChanges();
			},
			error: (err) => {
				console.error('❌ Error cargando emprendimientos:', err);
				this.error = 'Error al cargar los emprendimientos';
				this.isLoading = false;
				this.emprendimientos = [];
				this.filteredEmprendimientos = [];
				this.cdr.detectChanges();
			}
		});
	}

	private updateValidators(): void {
		if (this.required) {
			this.emprendimientoControl.setValidators([Validators.required]);
		} else {
			this.emprendimientoControl.clearValidators();
		}
		this.emprendimientoControl.updateValueAndValidity();
	}

	filterEmprendimientos(searchText: string): void {
		this.searchText = searchText;

		if (!searchText || searchText.trim() === '') {
			this.filteredEmprendimientos = [...this.emprendimientos];
			return;
		}

		const filterValue = searchText.toLowerCase().trim();
		this.filteredEmprendimientos = this.emprendimientos.filter(emp =>
			emp.nombreComercialEmprendimiento.toLowerCase().includes(filterValue)
		);

		console.log(`🔎 Búsqueda: "${searchText}" - Resultados: ${this.filteredEmprendimientos.length}`);
	}

	clearSearch(): void {
		this.searchText = '';
		this.filteredEmprendimientos = [...this.emprendimientos];
	}

	onEmprendimientoSelected(idEmprendimiento: number): void {
		console.log('🎯 Emprendimiento seleccionado:', idEmprendimiento);
		
		if (idEmprendimiento) {
			const emprendimiento = this.emprendimientos.find(e => e.id === idEmprendimiento);
			console.log('📝 Detalles:', emprendimiento);
			
			this.onChange(idEmprendimiento);
			this.emprendimientoSelected.emit(idEmprendimiento);
			this.onTouched();
			this.clearSearch();
		}
	}

	clearSelection(): void {
		console.log('🗑️ Limpiando selección');
		this.emprendimientoControl.setValue(null);
		this.onChange(null);
		this.emprendimientoSelected.emit(null as any);
		this.onTouched();
		this.clearSearch();
	}

	getEmprendimientoName(id: number): string {
		const emprendimiento = this.emprendimientos.find(e => e.id === id);
		return emprendimiento ? emprendimiento.nombreComercialEmprendimiento : '';
	}

	trackByFn(index: number, item: Emprendimiento): number {
		return item.id;
	}

	writeValue(value: number | null): void {
		console.log('✍️ writeValue llamado con:', value);
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
		console.log('🔒 setDisabledState:', isDisabled);
		this.disabled = isDisabled;
		if (isDisabled) {
			this.emprendimientoControl.disable();
		} else {
			this.emprendimientoControl.enable();
		}
	}
}