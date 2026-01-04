import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { SolicitudesService } from '../../../core/services/solicitudes.service'; // 👈 CORRECTO
import { AuthService } from '../../auth/auth.service';
import { ModalObservacionesSolicitudComponent } from '../../shared/components/modal-observaciones-solicitud/modal-observaciones-solicitud.component';
import { SolicitudAprobacionListado, SolicitudesPaginadasResponse } from '../../../core/types/solicitudes.types';
import { DetailsEmprendimientoComponent } from "../../emprendedor/gestion-emprendedor/emprendimiento/details-emprendimiento/details-emprendimiento.component"; // 👈 AGREGAR

@Component({
	selector: 'app-admin-solicitudes',
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
		MatPaginatorModule,
		DetailsEmprendimientoComponent
	],
	templateUrl: './admin-solicitudes.component.html',
	styleUrls: ['./admin-solicitudes.component.css'],
})
export class AdminSolicitudesComponent implements OnInit {
	solicitudes: SolicitudAprobacionListado[] = [];
	filteredSolicitudes: SolicitudAprobacionListado[] = [];
	loading = false;
	searchTerm = '';

	selectedEstado: string = '';
	fechaInicio: string = '';
	fechaFin: string = '';

	// Paginación
	totalElements = 0;
	pageSize = 10;
	pageIndex = 0;
	pageSizeOptions = [5, 10, 25, 50];

	showDetalleModal = false;
	solicitudSeleccionadaId: number | null = null;

	// Tabs
	selectedTab = 0;

	constructor(
		private solicitudesService: SolicitudesService, // 👈 CORRECTO
		private router: Router,
		private dialog: MatDialog,
		private authServices: AuthService
	) { }

	ngOnInit() {
		this.loadSolicitudes();
	}

	loadSolicitudes() {
		this.loading = true;
		const token = localStorage.getItem('token');
		if (!token) {
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
			this.loading = false;
			return;
		}

		this.solicitudesService
			.listarSolicitudesPendientes(this.pageIndex, this.pageSize)
			.subscribe({
				next: (response: SolicitudesPaginadasResponse) => { // 👈 TIPAR
					this.solicitudes = response.content || [];
					this.filteredSolicitudes = [...this.solicitudes];
					this.totalElements = response.pageable.length || 0;
					this.pageIndex = response.pageable.page || 0;
					this.pageSize = response.pageable.size || this.pageSize;

					this.applyFilters();
					this.loading = false;
				},
				error: (error: any) => { // 👈 TIPAR
					console.error('Error al cargar solicitudes:', error);
					this.loading = false;
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
				},
			});
	}

	cambiarPagina(event: PageEvent): void {
		this.pageIndex = event.pageIndex;
		this.pageSize = event.pageSize;
		this.loadSolicitudes();
	}

	applyFilters() {
		let filtered = [...this.solicitudes];

		if (this.searchTerm && this.searchTerm.trim() !== '') {
			const searchLower = this.searchTerm.toLowerCase().trim();
			filtered = filtered.filter(
				(s) =>
					(s.nombreEmprendimiento ?? '').toLowerCase().includes(searchLower) ||
					(s.nombreCiudad ?? '').toLowerCase().includes(searchLower) ||
					(s.nombreSolicitante ?? '').toLowerCase().includes(searchLower) ||
					String(s.id ?? '').toLowerCase().includes(searchLower)
			);
		}

		this.filteredSolicitudes = filtered;
	}

	onFilterChange() {
		this.pageIndex = 0;
		this.loadSolicitudes();
	}

	onSearch(event: any) {
		this.searchTerm = (event?.target?.value || '').toLowerCase();
		this.applyFilters();
	}

	setTab(index: number) {
		this.selectedTab = index;
		this.pageIndex = 0;
		this.loadSolicitudes();
	}

	clearFilters() {
		this.selectedEstado = '';
		this.fechaInicio = '';
		this.fechaFin = '';
		this.searchTerm = '';
		this.pageIndex = 0;
		this.loadSolicitudes();
	}

	verDetalle(solicitud: SolicitudAprobacionListado) {
		if (!solicitud || !solicitud.id) {
			this.dialog.open(MensajeConfirmacionComponent, {
				width: '420px',
				data: {
					subject: 'Solicitud',
					title: 'No se pudo abrir esta solicitud',
					subtitle: 'La solicitud no tiene un identificador válido.',
					type: 'error',
				},
			});
			return;
		}

		// ✅ Abrir modal con variables booleanas
		this.solicitudSeleccionadaId = solicitud.id;
		this.showDetalleModal = true;
	}

	// ✅ AGREGAR método para cerrar
	closeDetalleModal(): void {
		this.solicitudSeleccionadaId = null;
		this.showDetalleModal = false;
	}

	aprobarSolicitud(solicitud: SolicitudAprobacionListado) {
		if (!solicitud.id) return;

		const dialogRef = this.dialog.open(MensajeConfirmacionComponent, {
			width: '420px',
			data: {
				subject: 'Aprobar Solicitud',
				title: `¿Confirmas aprobar la solicitud #${solicitud.id}?`,
				subtitle: 'Esta acción aprobará la solicitud del emprendimiento.',
				type: 'info',
			},
		});

		dialogRef.afterClosed().subscribe((confirmed) => {
			if (confirmed) {
				this.loading = true;
				this.solicitudesService.aprobarSolicitud(solicitud.id).subscribe({
					next: (response: any) => { // 👈 TIPAR
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Solicitud Aprobada',
								title: 'Solicitud aprobada exitosamente',
								subtitle: response.mensaje || 'La solicitud ha sido aprobada.',
								type: 'success',
							},
						});
						this.loadSolicitudes();
					},
					error: (err: any) => { // 👈 TIPAR
						console.error('Error al aprobar solicitud:', err);
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Error',
								title: 'Error al aprobar la solicitud',
								subtitle: err.error?.error || 'No se pudo completar la operación.',
								type: 'error',
							},
						});
						this.loading = false;
					},
				});
			}
		});
	}

	rechazarSolicitud(solicitud: SolicitudAprobacionListado) {
		if (!solicitud.id) return;

		const dialogRef = this.dialog.open(ModalObservacionesSolicitudComponent, {
			width: '600px',
			disableClose: true,
			data: {
				tipo: 'rechazar',
				solicitudId: solicitud.id,
				nombreEmprendimiento: solicitud.nombreEmprendimiento
			}
		});

		dialogRef.afterClosed().subscribe((resultado) => {
			if (resultado) {
				this.loading = true;
				this.solicitudesService.rechazarSolicitud(solicitud.id, resultado.texto).subscribe({
					next: (response: any) => { // 👈 TIPAR
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Solicitud Rechazada',
								title: 'Solicitud rechazada exitosamente',
								subtitle: response.mensaje || 'La solicitud ha sido rechazada.',
								type: 'success',
							},
						});
						this.loadSolicitudes();
					},
					error: (err: any) => { // 👈 TIPAR
						console.error('Error al rechazar solicitud:', err);
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Error',
								title: 'Error al rechazar la solicitud',
								subtitle: err.error?.error || 'No se pudo completar la operación.',
								type: 'error',
							},
						});
						this.loading = false;
					},
				});
			}
		});
	}

	enviarObservaciones(solicitud: SolicitudAprobacionListado) {
		if (!solicitud.id) return;

		const dialogRef = this.dialog.open(ModalObservacionesSolicitudComponent, {
			width: '600px',
			disableClose: true,
			data: {
				tipo: 'observaciones',
				solicitudId: solicitud.id,
				nombreEmprendimiento: solicitud.nombreEmprendimiento
			}
		});

		dialogRef.afterClosed().subscribe((resultado) => {
			if (resultado) {
				this.loading = true;
				this.solicitudesService.enviarObservaciones(solicitud.id, resultado.texto).subscribe({
					next: (response: any) => { // 👈 TIPAR
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Observaciones Enviadas',
								title: 'Observaciones enviadas exitosamente',
								subtitle: response.mensaje || 'Las observaciones han sido enviadas.',
								type: 'success',
							},
						});
						this.loadSolicitudes();
					},
					error: (err: any) => { // 👈 TIPAR
						console.error('Error al enviar observaciones:', err);
						this.dialog.open(MensajeConfirmacionComponent, {
							width: '420px',
							data: {
								subject: 'Error',
								title: 'Error al enviar observaciones',
								subtitle: err.error?.error || 'No se pudo completar la operación.',
								type: 'error',
							},
						});
						this.loading = false;
					},
				});
			}
		});
	}
}