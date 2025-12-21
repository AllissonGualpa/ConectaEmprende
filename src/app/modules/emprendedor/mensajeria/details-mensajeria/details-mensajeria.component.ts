import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationDto, NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-details-mensajeria',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './details-mensajeria.component.html',
})
export class DetailsMensajeriaComponent implements OnInit {
  notificacion: NotificationDto | null = null;
  loading = false;
  error = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notificacionId: number },
    private dialogRef: MatDialogRef<DetailsMensajeriaComponent>,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.data?.notificacionId) {
      this.cargarNotificacion(this.data.notificacionId);
    } else {
      this.error = true;
    }
  }

  cargarNotificacion(id: number): void {
    this.loading = true;
    this.notificationService.obtenerNotificacionPorId(id).subscribe({
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
