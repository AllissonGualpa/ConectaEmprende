import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';

import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { ValoracionService } from '../../../core/services/valoracion.service';
import { ListadoAutoevaluacionDTO, AutoevaluacionesPaginadasResponse } from '../../../core/types/valoracion.types';
import { AutoevaluacionDetalleModalComponent } from '../../shared/components/autoevaluacion-detalle-modal/autoevaluacion-detalle-modal.component';

@Component({
	selector: 'app-admin-autoevaluacion',
	standalone: true,
	imports: [
		CommonModule,
		NavbarAdminComponent,
		FormsModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatPaginatorModule
	],
	templateUrl: './admin-autoevaluacion.component.html',
	styleUrls: ['./admin-autoevaluacion.component.css']
})
export class AdminAutoevaluacionComponent implements OnInit, OnDestroy {

	autoevaluaciones: ListadoAutoevaluacionDTO[] = [];
	filteredAutoevaluaciones: ListadoAutoevaluacionDTO[] = [];
	loading = false;

	searchTerm = '';
	fechaInicio: string | null = null;
	fechaFin: string | null = null;

	// Paginación
	totalElements = 0;
	pageSize = 10;
	pageIndex = 0;
	pageSizeOptions = [5, 10, 25, 50];

	// Ordenamiento
	sortField = 'fechaRespuesta';
	sortDirection: 'asc' | 'desc' = 'desc';

	private _unsubscribeAll: Subject<any> = new Subject<any>();

	constructor(
		private valoracionService: ValoracionService,
		private router: Router,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.loadAutoevaluaciones();
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next(null);
		this._unsubscribeAll.complete();
	}

	loadAutoevaluaciones(): void {
		this.loading = true;

		const token =
			localStorage.getItem('token') ||
			localStorage.getItem('accessToken') ||
			localStorage.getItem('authToken');

		if (!token) {
			this.dialog.open(MensajeConfirmacionComponent, {
				width: '420px',
				data: {
					subject: 'Autenticación',
					title: 'No estás autenticado',
					subtitle: 'Por favor, inicia sesión para continuar.',
					type: 'error'
				}
			});
			this.router.navigate(['/login']);
			this.loading = false;
			return;
		}

		const sort = `${this.sortField},${this.sortDirection}`;

		this.valoracionService
			.listarAutoevaluaciones(this.pageIndex, this.pageSize, sort)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe({
				next: (response: AutoevaluacionesPaginadasResponse) => {
					console.log('Respuesta del API:', response);

					this.autoevaluaciones = response.content || [];
					this.filteredAutoevaluaciones = [...this.autoevaluaciones];

					// Actualizar información de paginación
					if (response.pageable) {
						this.totalElements = response.pageable.length;
						this.pageIndex = response.pageable.page;
						this.pageSize = response.pageable.size;
					}

					this.applyFilters();
					this.loading = false;
				},
				error: (err) => {
					console.error('Error al cargar autoevaluaciones:', err);

					if (err.status === 401 || err.status === 403) {
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Autenticación',
								title: 'Sesión expirada',
								subtitle: 'Por favor, inicia sesión nuevamente.',
								type: 'error'
							}
						});
						this.router.navigate(['/login']);
					}

					this.autoevaluaciones = [];
					this.filteredAutoevaluaciones = [];
					this.totalElements = 0;
					this.loading = false;
				}
			});
	}

	cambiarPagina(event: PageEvent): void {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.loadAutoevaluaciones();
	}

	applyFilters(): void {
		let filtered = [...this.autoevaluaciones];

		if (this.searchTerm && this.searchTerm.trim() !== '') {
			const searchLower = this.searchTerm.toLowerCase().trim();
			filtered = filtered.filter(
				(a) =>
					(a.emprendimiento ?? '').toLowerCase().includes(searchLower) ||
					(a.formulario ?? '').toLowerCase().includes(searchLower) ||
					String(a.idAutoevaluacion ?? '').toLowerCase().includes(searchLower)
			);
		}

		this.filteredAutoevaluaciones = filtered;
	}

	onFilterChange(): void {
		this.pageIndex = 0;
		this.loadAutoevaluaciones();
	}

	onSearch(event: any): void {
		this.searchTerm = (event?.target?.value || '').toLowerCase();
		this.applyFilters();
	}

	clearFilters(): void {
		this.searchTerm = '';
		this.fechaInicio = null;
		this.fechaFin = null;
		this.pageIndex = 0;
		this.loadAutoevaluaciones();
	}

	sortBy(field: string): void {
		if (this.sortField === field) {
			this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			this.sortField = field;
			this.sortDirection = 'desc';
		}
		this.pageIndex = 0;
		this.loadAutoevaluaciones();
	}

	changePageSize(newSize: number): void {
		this.pageSize = newSize;
		this.pageIndex = 0;
		this.loadAutoevaluaciones();
	}

	crearAutoevaluacion(): void {
		this.router.navigate(['/admin/autoevaluacion/create']);
	}

	verAutoevaluacion(autoevaluacion: ListadoAutoevaluacionDTO): void {
		this.dialog.open(AutoevaluacionDetalleModalComponent, {
			width: '900px',
			maxWidth: '95vw',
			maxHeight: '90vh',
			data: {
				idAutoevaluacion: autoevaluacion.idAutoevaluacion,
				nombreEmprendimiento: autoevaluacion.emprendimiento
			},
			panelClass: 'custom-dialog-container'
		});
	}

	formatearFecha(fecha: string): string {
		if (!fecha) return '-';
		const date = new Date(fecha);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	getBadgeClass(tipoFormulario: string): string {
		const tipo = tipoFormulario?.toLowerCase() || '';

		if (tipo.includes('servicio')) {
			return 'bg-blue-100 text-blue-800';
		} else if (tipo.includes('producto')) {
			return 'bg-green-100 text-green-800';
		} else if (tipo.includes('autoevaluacion')) {
			return 'bg-purple-100 text-purple-800';
		}

		return 'bg-gray-100 text-gray-800';
	}

	get autoevaluacionesFiltradas(): ListadoAutoevaluacionDTO[] {
		return this.filteredAutoevaluaciones;
	}
}