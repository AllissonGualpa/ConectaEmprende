import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Notificacion } from '../../../../core/types/notificacion.types';
import { NotificacionesService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
	selector: 'app-details-mensajeria',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatIconModule],
	templateUrl: './details-mensajeria.component.html',
})
export class DetailsMensajeriaComponent implements OnInit {
	notificacion: Notificacion | null = null;
	loading = false;
	error = false;
	private usuarioId: number | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { notificacionId: number, mensajeEspecial?: boolean },
		private dialogRef: MatDialogRef<DetailsMensajeriaComponent>,
		private notificacionesService: NotificacionesService,
		private authService: AuthService
	) { }

	ngOnInit(): void {
		// Obtener el ID del usuario del perfil
		const perfil = this.authService.getPerfilLocal();
		this.usuarioId = perfil?.id || null;
		
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
				// Marcar como leída si no lo está y tenemos el usuarioId
				if (!notif.leida && this.usuarioId) {
					this.marcarComoLeida(this.usuarioId, id);
				}
			},
			error: () => {
				this.error = true;
				this.loading = false;
			}
		});
	}

	marcarComoLeida(usuarioId: number, notificacionId: number): void {
		this.notificacionesService.marcarComoLeida(usuarioId, notificacionId).subscribe({
			next: () => {
				// Actualizar el estado local
				if (this.notificacion) {
					this.notificacion.leida = true;
					this.notificacion.fechaLectura = new Date().toISOString();
				}
			},
			error: (err) => {
				console.error('Error al marcar como leída:', err);
			}
		});
	}

	cerrar(): void {
		// Indicar si la notificación fue marcada como leída para actualizar la lista
		this.dialogRef.close({ 
			marcarComoLeida: this.notificacion?.leida || false,
			notificacionId: this.data.notificacionId 
		});
	}
	
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