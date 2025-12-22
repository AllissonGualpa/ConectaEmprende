import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationDto } from '../../../../core/services/notification.service';
import { AuthService } from '../../../auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetailsMensajeriaComponent } from '../details-mensajeria/details-mensajeria.component';
@Component({
  selector: 'app-seccion-mensajeria',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './seccion-mensajeria.component.html',
  styleUrl: './seccion-mensajeria.component.css'
})
export class SeccionMensajeriaComponent implements OnInit {
  notificaciones: NotificationDto[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'titulo', 'mensaje', 'fecha', 'hora', 'estado', 'accion'];
  
  // paginación
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const perfil = this.authService.getPerfilLocal ? this.authService.getPerfilLocal() : null;
    const usuarioId = perfil && perfil.id ? perfil.id : Number(localStorage.getItem('usuarioId') || 0);
    if (!usuarioId) {
      this.notificaciones = [];
      return;
    }

    this.loadPage(usuarioId, 0);
  }

  private loadPage(usuarioId: number, pageIndex: number): void {
    this.loading = true;
    this.notificationService.getNotificacionesPaged(usuarioId, pageIndex, this.size).subscribe({
      next: (resp) => {
        this.notificaciones = resp?.content || [];
        this.totalElements = resp?.totalElements || 0;
        this.totalPages = resp?.totalPages ?? Math.ceil((this.totalElements || 0) / this.size);
        this.page = resp?.number ?? pageIndex;
        this.loading = false;
        // --- NOTIFICACIÓN SIMULADA (MENSAJE QUEMADO PARA DEMO) ---
        //borrar desp
        const yaExiste = this.notificaciones.some(n => n.id === 9999);
        if (!yaExiste) {
          this.notificaciones = [
            {
              id: 9999,
              nombreEmprendimiento: 'HealthLoop App',
              mensaje: 'Tu emprendimiento ha recibido una baja valoración. Debes realizar una autoevaluación.',
              fechaCreacion: new Date().toISOString(),
              leida: false,
              tipoNombre: 'Alerta',
              // ...otros campos necesarios para la tabla...
            } as any,
            ...this.notificaciones
          ];
          this.totalElements++;
        }
        // --- FIN MENSAJE QUEMADO ---
      },
      error: (err) => {
        console.error('Error al cargar notificaciones paginadas:', err);
        this.notificaciones = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.page = 0;
        this.loading = false;
      }
    });
  }

  prevPage(): void {
    if (this.page <= 0) return;
    const perfil = this.authService.getPerfilLocal ? this.authService.getPerfilLocal() : null;
    const usuarioId = perfil && perfil.id ? perfil.id : Number(localStorage.getItem('usuarioId') || 0);
    if (!usuarioId) return;
    this.loadPage(usuarioId, this.page - 1);
  }

  nextPage(): void {
    if (this.page >= (this.totalPages - 1)) return;
    const perfil = this.authService.getPerfilLocal ? this.authService.getPerfilLocal() : null;
    const usuarioId = perfil && perfil.id ? perfil.id : Number(localStorage.getItem('usuarioId') || 0);
    if (!usuarioId) return;
    this.loadPage(usuarioId, this.page + 1);
  }

  goToPage(n: number): void {
    if (n < 0 || n >= this.totalPages) return;
    const perfil = this.authService.getPerfilLocal ? this.authService.getPerfilLocal() : null;
    const usuarioId = perfil && perfil.id ? perfil.id : Number(localStorage.getItem('usuarioId') || 0);
    if (!usuarioId) return;
    this.loadPage(usuarioId, n);
  }

  getFecha(fechaIso?: string): string {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleDateString();
  }

  getHora(fechaIso?: string): string {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  abrirNotificacion(notificacion: NotificationDto): void {
    // --- LÓGICA PARA MENSAJE QUEMADO (DEMO) ---
    // Puedes borrar este if después de la presentación
    if (notificacion.id === 9999) {
      // Abrir el modal de detalle con mensaje especial
      this.dialog.open(DetailsMensajeriaComponent, {
        width: '700px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: {
          notificacionId: 9999,
          mensajeEspecial: true
        },
        panelClass: 'custom-dialog-container'
      });
      return;
    }
    // --- FIN MENSAJE QUEMADO ---
    
    console.log('Abriendo notificación en modal:', notificacion);
    
    // Abrir modal con los datos de la notificación
    const dialogRef = this.dialog.open(DetailsMensajeriaComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { notificacionId: notificacion.id },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal cerrado:', result);
      
      // Si el modal devuelve que se marcó como leída, actualizar localmente
      if (result?.marcarComoLeida) {
        notificacion.leida = true;
        
        // Opcional: recargar la página actual para refrescar los datos
        const perfil = this.authService.getPerfilLocal ? this.authService.getPerfilLocal() : null;
        const usuarioId = perfil && perfil.id ? perfil.id : Number(localStorage.getItem('usuarioId') || 0);
        if (usuarioId) {
          this.loadPage(usuarioId, this.page);
        }
      }
    });
  }
}