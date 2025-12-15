import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService, NotificationDto } from '../../../../core/services/notification.service';
import { AuthService } from '../../../auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-seccion-mensajeria',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './seccion-mensajeria.component.html',
  styleUrl: './seccion-mensajeria.component.css'
})
export class SeccionMensajeriaComponent implements OnInit {
  notificaciones: NotificationDto[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'titulo', 'mensaje', 'fecha', 'hora', 'estado', 'accion'];
  // paginación
  page = 0; // page index (0-based)
  size = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
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

  // helpers de paginación (usa perfil almacenado)
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

  // Formatea fecha y hora para la tabla
  getFecha(fechaIso?: string): string {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleDateString();
  }

  getHora(fechaIso?: string): string {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  abrirNotificacion(n: NotificationDto) {
    // placeholder: marcar como leída localmente y abrir enlace si existe
    n.leida = true;
    if (n.enlace) {
      window.open(n.enlace, '_blank');
    } else {
      console.log('Abrir notificación', n);
    }
  }
}
