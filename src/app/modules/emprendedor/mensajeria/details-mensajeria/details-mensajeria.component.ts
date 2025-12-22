import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationDto, NotificationService } from '../../../../core/services/notification.service';
import { RouterModule, Router } from '@angular/router';//borrar desp-->

@Component({
  selector: 'app-details-mensajeria',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, RouterModule],
  templateUrl: './details-mensajeria.component.html',
})
export class DetailsMensajeriaComponent implements OnInit {
  notificacion: NotificationDto | null = null;
  loading = false;
  error = false;
  mensajeEspecial = false; //borrar desp-->

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { notificacionId: number, mensajeEspecial?: boolean  },
    private dialogRef: MatDialogRef<DetailsMensajeriaComponent>,
    private notificationService: NotificationService,
    private router: Router //borrar desp-->
    /** lo que estaba antes, lo de arriba se borra desp
     * @Inject(MAT_DIALOG_DATA) public data: { notificacionId: number },
    private dialogRef: MatDialogRef<DetailsMensajeriaComponent>,
    private notificationService: NotificationService
     */
  ) {}

  ngOnInit(): void {
    //borrar desp
    if (this.data?.mensajeEspecial) {
      this.mensajeEspecial = true;
      this.notificacion = {
        id: 9999,
        nombreEmprendimiento: 'HealthLoop App',
        mensaje: 'Tu emprendimiento ha recibido una baja valoración.',
        titulo: '',
        fechaCreacion: new Date().toISOString(),
        leida: false,
        tipoNombre: 'Alerta',
      } as any;
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
