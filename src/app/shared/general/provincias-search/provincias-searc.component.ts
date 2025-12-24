import { AfterViewInit, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SharedGeneralService } from '../shared-general.service';
import { Provincia } from '../shared-general.types';
import { debounceTime, Observable, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { AsyncPipe, CommonModule, TitleCasePipe } from '@angular/common';

@Component({
	selector: 'app-provincias-search',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatAutocompleteModule,
		MatIconModule,
		MatButtonModule,
		CommonModule,
		AsyncPipe,
		TitleCasePipe
	],
	templateUrl: './provincias-search.component.html',
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(() => ProvinciasSearchComponent),
		multi: true
	}]
})
export class ProvinciasSearchComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
	provinciaControl!: FormControl;

	private onChange: Function = () => { };
	onTouched: Function = () => { };  // ✅ Cambiado a public

	private _provincias: Provincia[] = [];
	provinciaFiltered$!: Observable<Provincia[]>;

	private _titlecasePipe = new TitleCasePipe();
	private _unsubscribeAll: Subject<any> = new Subject<any>();

	@Input() placeholder: string = 'Seleccionar provincia';
	@Input() required: boolean = false;
	@Output() provinciaSelected = new EventEmitter<Provincia | null>();

	constructor(private readonly sharedGeneralService: SharedGeneralService) { }

	ngOnInit(): void {
		console.log('🚀 [PROVINCIA] Componente inicializado');

		// Inicializar FormControl con validadores
		const validators = this.required ? [Validators.required] : [];
		this.provinciaControl = new FormControl('', validators);

		// Suscribirse al BehaviorSubject de provincias
		this.sharedGeneralService.provincias$
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe({
				next: (provincias) => {
					console.log('✅ [PROVINCIA] Provincias recibidas del BehaviorSubject:', provincias.length);
					this._provincias = provincias.filter(p => p.activo);
					console.log('✅ [PROVINCIA] Provincias activas:', this._provincias.length);
				},
				error: (error) => {
					console.error('❌ [PROVINCIA] Error:', error);
				}
			});

		// Cargar provincias (esto actualizará el BehaviorSubject)
		this.loadProvincias();
	}

	ngAfterViewInit(): void {
		// Suscripción a cambios del autocomplete para filtrar provincias
		this.provinciaFiltered$ = this.provinciaControl.valueChanges.pipe(
			takeUntil(this._unsubscribeAll),
			startWith(this.provinciaControl.value),
			debounceTime(300),
			switchMap((value) => {
				if (!value || value === '') {
					this.onChange(null);
					this.provinciaSelected.emit(null);
					return of(this._provincias);
				} else {
					return of(this.filtrarProvincias(value));
				}
			})
		);
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next(null);
		this._unsubscribeAll.complete();
	}

	loadProvincias(): void {
		console.log('📡 [PROVINCIA] Llamando a getProvincias()...');

		// Solo hace la llamada HTTP si no hay provincias cargadas
		if (this._provincias.length === 0) {
			this.sharedGeneralService.getProvincias()
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe({
					next: () => {
						console.log('✅ [PROVINCIA] Llamada HTTP completada');
					},
					error: (error) => {
						console.error('❌ [PROVINCIA] Error al cargar:', error);
					}
				});
		}
	}

	/**
	 * Filtra provincias según el valor ingresado
	 */
	private filtrarProvincias(valor: any): Provincia[] {
		if (!this._provincias || this._provincias.length === 0) {
			return [];
		}

		// Si el valor es un objeto Provincia (ya seleccionado)
		if (valor && typeof valor === 'object' && valor.id) {
			return this._provincias.filter(p =>
				p.nombre.toLowerCase().includes(valor.nombre.toLowerCase())
			);
		}

		// Si el valor es un string (usuario escribiendo)
		if (typeof valor === 'string') {
			const filterValue = valor.toLowerCase();
			return this._provincias.filter(p =>
				p.nombre.toLowerCase().includes(filterValue)
			);
		}

		return this._provincias;
	}

	/**
	 * Define el texto a mostrar en el input del autocomplete
	 */
	showNombreProvincia = (provincia: any): string => {
		if (!provincia) return '';

		if (typeof provincia === 'object' && provincia.nombre) {
			return this._titlecasePipe.transform(provincia.nombre);
		}

		return typeof provincia === 'string' ? provincia : '';
	}

	/**
	 * Se ejecuta al seleccionar una provincia del autocomplete
	 */
	onProvinciaSelected(event: MatAutocompleteSelectedEvent): void {
		const provinciaSeleccionada: Provincia = event.option.value;
		console.log('✅ [PROVINCIA] Provincia seleccionada:', provinciaSeleccionada);

		this.onChange(provinciaSeleccionada);
		this.provinciaSelected.emit(provinciaSeleccionada);
	}

	/**
	 * Limpia la selección
	 */
	clear(event: Event): void {
		event.stopPropagation();
		event.preventDefault();
		console.log('🗑️ [PROVINCIA] Limpiando selección');

		this.provinciaControl.setValue('');
		this.onChange(null);
		this.provinciaSelected.emit(null);
	}

	// ==========================================
	// Implementación de ControlValueAccessor
	// ==========================================

	writeValue(value: Provincia | null): void {
		if (value) {
			this.provinciaControl.setValue(value, { emitEvent: false });
		} else {
			this.provinciaControl.setValue('', { emitEvent: false });
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
			this.provinciaControl.disable();
		} else {
			this.provinciaControl.enable();
		}
	}

	/**
	 * TrackBy function para optimizar el rendering
	 */
	trackByFn(index: number, item: Provincia): number {
		return item.id;
	}
}