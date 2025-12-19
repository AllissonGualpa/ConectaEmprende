import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationDto, NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details-mensajeria',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './details-mensajeria.component.html',
})
export class DetailsMensajeriaComponent implements OnInit {
  notificacion: NotificationDto | null = null;
  loading = false;
  error = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notificacionId: number },
    private dialogRef: MatDialogRef<DetailsMensajeriaComponent>,
    private notificationService: NotificationService,
    private router: Router
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
        console.log('Notificación cargada:', notif);
        this.notificacion = notif;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar notificación:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return 'Sin fecha';
    
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', opciones);
  }

  irADetalle(): void {
    if (this.notificacion?.enlace) {
      // Cerrar el modal y navegar
      this.dialogRef.close({ marcarComoLeida: true });
      this.router.navigate([this.notificacion.enlace]);
    }
  }

  cerrar(): void {
    this.dialogRef.close({ marcarComoLeida: false });
  }
}