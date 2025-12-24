import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';
import { EditSolicitudEmprendimientoComponent } from '../../emprendedor/gestion-emprendedor/edit-solicitud-emprendimiento/edit-solicitud-emprendimiento.component';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { SharedGeneralService } from '../../../shared/general/shared-general.service';
@Component({
	selector: 'app-admin-emprendimientos',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		NavbarAdminComponent,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule,
		EditSolicitudEmprendimientoComponent,
	],
	templateUrl: './admin-emprendimientos.component.html'
})
export class AdminEmprendimientosComponent implements OnInit {
	emprendimientos: any[] = [];
	tiposEmprendimiento: any[] = [];
	categorias: any[] = [];
	ciudades: any[] = [];

	// Filtros
	searchTerm = '';
	selectedCategory = '';
	selectedCiudad = '';
	selectedSubtipo = ''; // NUEVO

	loading = false;

	// Paginación
	pageSize: number = 10;
	currentPage: number = 0;
	totalElements: number = 0;
	totalPages: number = 0;
	pages: number[] = [];
	startIndex: number = 0;
	endIndex: number = 0;

	showDesactivarModal = false;
	emprendimientoAInactivar: any = null;

	showEditSolicitudModal: boolean = false;
	selectedEditId: number | null = null;

	// Opciones de subtipo
	subtipos = [
		{ value: 'Servicio', label: 'Servicio' },
		{ value: 'Producto', label: 'Producto' }
	];

	constructor(
		private emprendimientoService: EmprendimientoService,
		private sharedGeneralService: SharedGeneralService,
		private router: Router,
		private dialog: MatDialog,
		private authServices: AuthService
	) { }

	ngOnInit() {
		this.loadData();
	}

	loadData() {
		this.loading = true;
		const token = localStorage.getItem('token');

		if (!token) {
			this.loading = false;
			this.dialog.open(MensajeConfirmacionComponent, {
				width: '420px',
				data: {
					subject: 'Autenticación',
					title: 'No estás autenticado',
					subtitle: 'Por favor, inicia sesión para continuar.',
					type: 'error',
				},
			});
			this.router.navigate(['/login']);
			return;
		}

		// Cargar datos iniciales
		forkJoin({
			tipos: this.emprendimientoService.getTiposEmprendimiento(),
			categorias: this.sharedGeneralService.getCategorias(), // Ajusta según tu servicio
			ciudades: this.sharedGeneralService.getCiudades(), // Ajusta según tu servicio
		}).subscribe({
			next: ({ tipos, categorias }) => {
				this.tiposEmprendimiento = tipos;
				this.categorias = categorias;
				// this.ciudades = ciudades;

				// Cargar emprendimientos
				this.applyFilters();
			},
			error: (error) => {
				console.error('Error al cargar datos:', error);
				this.loading = false;
				this.handleAuthError(error);
			},
		});
	}

	applyFilters() {
		this.loading = true;

		this.emprendimientoService.getEmprendimientosFiltrado(
			this.currentPage,
			this.pageSize,
			this.searchTerm || undefined,
			undefined, // tipo
			this.selectedSubtipo || undefined,
			this.selectedCategory || undefined,
			this.selectedCiudad || undefined
		).subscribe({
			next: (response) => {
				this.emprendimientos = this.mapEmprendimientos(response.content);

				const pageable = response.pageable;
				this.totalElements = pageable.length || 0;
				this.pageSize = pageable.size || 10;
				this.currentPage = pageable.page || 0;
				this.totalPages = pageable.lastPage + 1 || 1;

				this.computePaginationInfo();
				this.loading = false;
			},
			error: (error) => {
				console.error('Error al aplicar filtros:', error);
				this.loading = false;
				this.handleAuthError(error);
			},
		});
	}

	private mapEmprendimientos(lista: any[]): any[] {
		return lista.map((emp) => {
			const tipoData = this.tiposEmprendimiento.find(
				(t) => t.id === emp.tipoEmprendimientoId
			);
			return {
				...emp,
				tipoInfo: {
					tipo: tipoData ? tipoData.tipo : emp.tipoEmprendimiento || 'Desconocido',
					subTipo: tipoData ? tipoData.subTipo.trim() : emp.subTipoEmprendimiento || 'N/A',
				},
			};
		});
	}

	reload() {
		this.searchTerm = '';
		this.selectedCategory = '';
		this.selectedCiudad = '';
		this.selectedSubtipo = '';
		this.currentPage = 0;
		this.applyFilters();
	}

	private computePaginationInfo(): void {
		this.currentPage = Number(this.currentPage) || 0;

		if (this.totalElements <= 0 || this.pageSize <= 0) {
			this.totalPages = 0;
			this.pages = [];
			this.startIndex = 0;
			this.endIndex = 0;
			return;
		}

		if (!this.totalPages || this.totalPages <= 0) {
			this.totalPages = Math.max(1, Math.ceil(this.totalElements / this.pageSize));
		}

		if (this.currentPage >= this.totalPages) {
			this.currentPage = this.totalPages - 1;
		}
		if (this.currentPage < 0) this.currentPage = 0;

		this.pages = Array.from({ length: this.totalPages }, (_, i) => i);

		const baseIndex = this.currentPage * this.pageSize;
		this.startIndex = baseIndex + 1;
		this.endIndex = Math.min(baseIndex + this.pageSize, this.totalElements);
	}

	nextPage(): void {
		if (this.currentPage < this.totalPages - 1) {
			this.currentPage++;
			this.applyFilters();
		}
	}

	prevPage(): void {
		if (this.currentPage > 0) {
			this.currentPage--;
			this.applyFilters();
		}
	}

	goToPage(page: number): void {
		if (page < 0 || page >= this.totalPages) return;
		this.currentPage = page;
		this.applyFilters();
	}

	formatFecha(fecha: string): string {
		if (!fecha) return '';
		return new Date(fecha).toLocaleDateString('es-ES');
	}

	editarEmprendimiento(emp: any) {
		const id = emp?.idEmprendimiento ?? emp?.id ?? null;
		this.selectedEditId = id ? Number(id) : null;
		this.showEditSolicitudModal = true;
	}

	onEmprendimientoUpdated() {
		this.showEditSolicitudModal = false;
		this.selectedEditId = null;
		this.applyFilters();
	}

	closeEditSolicitudModal() {
		this.showEditSolicitudModal = false;
		this.selectedEditId = null;
	}

	desactivarEmprendimiento(emp: any) {
		this.emprendimientoAInactivar = emp;
		this.showDesactivarModal = true;
	}

	confirmarDesactivarEmprendimiento() {
		this.showDesactivarModal = false;
		// TODO: Implementar lógica de desactivación
	}

	private handleAuthError(error: any) {
		if (error.status === 401) {
			this.dialog.open(MensajeConfirmacionComponent, {
				width: '420px',
				data: {
					subject: 'Sesión expirada',
					title: 'Tu sesión ha expirado',
					subtitle: 'Por favor, inicia sesión nuevamente.',
					type: 'error',
				},
			});
			this.authServices.logout();
			this.router.navigate(['/login']);
		}
	}
}