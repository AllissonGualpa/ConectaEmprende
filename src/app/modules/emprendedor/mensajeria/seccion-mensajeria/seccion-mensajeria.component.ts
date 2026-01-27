import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetailsMensajeriaComponent } from '../details-mensajeria/details-mensajeria.component';
import { Notificacion } from '../../../../core/types/notificacion.types';
import { NotificacionesService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import { AutoevaluacionComponent } from '../../autoevaluacion/autoevaluacion.component';

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
  notificaciones: Notificacion[] = [];
  loading = false;
  displayedColumns: string[] = ['id', 'titulo', 'mensaje', 'fecha', 'hora', 'estado', 'accion'];
  
  // paginación
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private notificacionesService: NotificacionesService,
    private authService: AuthService,
    private dialog: MatDialog,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  private loadPage(pageIndex: number): void {
    this.loading = true;
    this.notificacionesService.obtenerNotificaciones(pageIndex, this.size).subscribe({
      next: (resp) => {
        this.notificaciones = resp?.content || [];
        this.totalElements = resp?.pageable.length || 0;
        this.totalPages = resp?.pageable.lastPage + 1 || 1;
        this.page = resp?.pageable.page ?? pageIndex;
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

  prevPage(): void {
    if (this.page <= 0) return;
    this.loadPage(this.page - 1);
  }

  nextPage(): void {
    if (this.page >= (this.totalPages - 1)) return;
    this.loadPage(this.page + 1);
  }

  goToPage(n: number): void {
    if (n < 0 || n >= this.totalPages) return;
    this.loadPage(n);
  }

  getFecha(fechaIso?: string): string {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleDateString();
  }

  getHora(fechaIso?: string): string {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  abrirNotificacion(notificacion: Notificacion): void {
    
    if (notificacion.tipoNombre === 'Autoevaluación Requerida' || 
      notificacion.titulo === 'Autoevaluación requerida') {
    
        const idRespuestaValoracion = notificacion.enlace;
        this.dialog.open(AutoevaluacionComponent, {
          width: '90vw',
          maxWidth: '1200px',
          maxHeight: '90vh',
          data: { 
            idEmprendimiento: notificacion.emprendimientoId, 
            idRespuestaValoracion: idRespuestaValoracion 
          },
          panelClass: 'custom-dialog-container',
          disableClose: true
        });
        return;
        }
    
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
        this.loadPage(this.page);
      }
    });
  }
}