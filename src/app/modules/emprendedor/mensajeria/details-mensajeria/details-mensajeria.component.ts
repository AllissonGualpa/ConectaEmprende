import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';//borrar desp-->
import { Notificacion } from '../../../../core/types/notificacion.types';
import { NotificacionesService } from '../../../../core/services/notification.service';

@Component({
	selector: 'app-details-mensajeria',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatIconModule, RouterModule],
	templateUrl: './details-mensajeria.component.html',
})
export class DetailsMensajeriaComponent implements OnInit {
	notificacion: Notificacion | null = null;
	loading = false;
	error = false;
	mensajeEspecial = false; //borrar desp-->

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { notificacionId: number, mensajeEspecial?: boolean },
		private dialogRef: MatDialogRef<DetailsMensajeriaComponent>,
		private notificacionesService: NotificacionesService,
		private router: Router //borrar desp-->
	) { }

	ngOnInit(): void {
		//borrar desp
		if (this.data?.mensajeEspecial) {
			this.mensajeEspecial = true;
			this.notificacion = {
				id: 9999,
				nombreEmprendimiento: 'HealthLoop App',
				mensaje: 'Tu emprendimiento ha recibido una baja valoración.',
				titulo: 'Autoevaluación requerida',
				fechaCreacion: new Date().toISOString(),
				leida: false,
				tipoNombre: 'Alerta',
				enlace: '',
				fechaLectura: null,
				prioridad: null,
				icono: null,
				color: null,
				metadata: null,
				emprendimientoId: 0,
				solicitudId: null,
				motivo: null,
				observaciones: null
			};
			this.loading = false;
			return;
		}//borrar desp
		if (this.data?.notificacionId) {
			this.cargarNotificacion(this.data.notificacionId);
		} else {
			this.error = true;
		}
	}

	cargarNotificacion(id: number): void {
		this.loading = true;
		this.notificacionesService.obtenerNotificacionPorId(id).subscribe({
			next: (notif) => {
				this.notificacion = notif;
				this.loading = false;
			},
			error: () => {
				this.error = true;
				this.loading = false;
			}
		});
	}

	cerrar(): void {
		this.dialogRef.close({ marcarComoLeida: true });
	}
	//borrar desp

	irAAutoevaluacion(): void {
		this.dialogRef.close();
		setTimeout(() => {
			// Puedes cambiar el ID aquí si tienes el id del emprendimiento real
			this.router.navigate(['/autoevaluacion', 1]);
		}, 200);
	}
	//borrar desp
	formatFecha(fecha: string | null): string {
		if (!fecha) return 'Sin fecha';
		return new Date(fecha).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}
}