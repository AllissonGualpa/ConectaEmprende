import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardItem, CardsComponent } from '../../../../../layout/cards/cards.component';
import { DetailsEmprendimientoComponent } from '../details-emprendimiento/details-emprendimiento.component';
import { EmprendimientoService } from '../../../../../core/services/emprendimiento.service';
@Component({
	selector: 'app-seccion-emprendimiento',
	standalone: true,
	imports: [
		CommonModule,
		CardsComponent,
		DetailsEmprendimientoComponent
	],
	templateUrl: './seccion-emprendimiento.component.html',
	styleUrls: ['./seccion-emprendimiento.component.css']
})
export class SeccionEmprendimientoComponent implements OnInit {
	emprendimientos: any[] = [];
	cardsArray: CardItem[] = [];

	showCreateSolicitudModal = false;
	showEditSolicitudModal = false;
	selectedEditId: number | null = null;
	loading = false;

	constructor(private emprendimientoService: EmprendimientoService, private router: Router) { }

	ngOnInit(): void {
		this.loadEmprendimientos();
	}

	mapEstado(estado: string): string {
		switch (estado) {
			case 'APROBADO':
			case 'PUBLICADO':
				return 'Aprobado';
			case 'PENDIENTE_APROBACION':
			case 'EN_REVISION':
				return 'En revisión';
			case 'RECHAZADO':
				return 'Rechazado';
			case 'BORRADOR':
				return 'Borrador';
			default:
				return estado;
		}
	}

	loadEmprendimientos(): void {
		this.loading = true;
		// Cargar todos los emprendimientos (puedes ajustar el size si quieres limitar)
		this.emprendimientoService.obtenerMisEmprendimientos(0, 100).subscribe({
			next: (response) => {
				console.log('Respuesta completa:', response);

				// Extraer el array de emprendimientos desde content
				const data = response.content || [];
				console.log('Emprendimientos encontrados:', data.length);
				this.emprendimientos = data;

				this.cardsArray = data.map((e) => {
					// Obtener la primera imagen
					const imagenPrincipal = e.multimedia && e.multimedia.length > 0
						? e.multimedia[0].urlArchivo
						: '/assets/img/inicio/foto5.png';

					// Obtener nombres de categorías
					const categoriasTexto = e.categorias && e.categorias.length > 0
						? e.categorias.map((cat: any) => cat.nombre).join(', ')
						: 'Sin categoría';

					return {
						id: e.idEmprendimiento,
						title: e.nombreComercialEmprendimiento || 'Emprendimiento sin nombre',
						description: `${e.subTipoEmprendimiento || 'Tipo desconocido'} en ${e.ciudadNombre || 'sin ciudad'}`,
						image: imagenPrincipal,
						category: categoriasTexto,
						location: `${e.ciudadNombre || 'Sin ciudad'}, ${e.provinciaNombre || ''}`,
						views: Math.floor(Math.random() * 20000) + 1000,
						status: this.mapEstado(e.estadoEmprendimiento),
						rawStatus: e.estadoEmprendimiento
					};
				});

				this.loading = false;
			},
			error: (err) => {
				console.error('Error al cargar emprendimientos', err);
				this.emprendimientos = [];
				this.cardsArray = [];
				this.loading = false;
			}
		});
	}

	openCreateSolicitudModal(): void {
		this.showCreateSolicitudModal = true;
	}

	closeCreateSolicitudModal(): void {
		this.showCreateSolicitudModal = false;
	}

	openEditSolicitudModal(item: CardItem): void {
		const estadosBloqueados = [
			'PENDIENTE_APROBACION',
			'RECHAZADO'
		];

		if (item.rawStatus && estadosBloqueados.includes(item.rawStatus)) {
			alert('No puedes editar un emprendimiento en revisión o rechazado.');
			return;
		}

		this.selectedEditId = item.id;
		this.showEditSolicitudModal = true;
	}

	closeEditSolicitudModal(): void {
		this.selectedEditId = null;
		this.showEditSolicitudModal = false;
	}

	onEmprendimientoUpdated(): void {
		this.closeEditSolicitudModal();
		this.loadEmprendimientos();
	}

	onEmprendimientoCreated(): void {
		this.closeCreateSolicitudModal();
		this.loadEmprendimientos();
	}

	onRoadmapClick(item: any) {
		this.router.navigate(['emprendedor/roadmap', item.id]);
	}
}