import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { AutoevaluacionService } from '../autoevaluacion.service';
import { Autoevaluacion } from '../autoevaluacion.types';
import { AutoevaluacionDetalleModalComponent } from '../../shared/components/autoevaluacion-detalle-modal/autoevaluacion-detalle-modal.component';

@Component({
  selector: 'app-admin-autoevaluacion',
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
    MatIconModule
  ],
  templateUrl: './admin-autoevaluacion.component.html',
  styleUrls: ['./admin-autoevaluacion.component.css']
})
export class AdminAutoevaluacionComponent implements OnInit {
  
  autoevaluaciones: Autoevaluacion[] = [];
  filtered: Autoevaluacion[] = [];
  loading = false;

  searchTerm = '';
  fechaInicio: string | null = null;
  fechaFin: string | null = null;

  // PAGINACIÓN LOCAL
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  pages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  constructor(
    private autoevaluacionService: AutoevaluacionService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAutoevaluaciones();
  }

  /** Cargar autoevaluaciones desde backend (sin paginación) */
  loadAutoevaluaciones(): void {
    this.loading = true;

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');

    if (!token) {
      this.dialog.open(MensajeConfirmacionComponent, {
        width: '420px',
        data: {
          subject: 'Autenticación',
          title: 'No estás autenticado',
          subtitle: 'Por favor, inicia sesión para continuar.',
          type: 'error'
        }
      });
      this.router.navigate(['/login']);
      this.loading = false;
      return;
    }

    this.autoevaluacionService
      .getEmprendimientos({
        search: this.searchTerm || undefined,
        fechaInicio: this.fechaInicio || undefined,
        fechaFin: this.fechaFin || undefined
      })
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del API:', response);
          
          // Manejar diferentes formatos de respuesta
          let data: Autoevaluacion[] = [];
          
          if (Array.isArray(response)) {
            data = response;
          } else if (response?.data && Array.isArray(response.data)) {
            data = response.data;
          } else if (response?.content && Array.isArray(response.content)) {
            data = response.content;
          } else if (response?.emprendimientos && Array.isArray(response.emprendimientos)) {
            data = response.emprendimientos;
          }
          
          console.log('Data procesada:', data);
          
          this.autoevaluaciones = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar autoevaluaciones:', err);
          this.autoevaluaciones = [];
          this.filtered = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.pages = [];
          this.loading = false;
        },
        complete: () => {
          console.log('Observable completado');
          this.loading = false;
        }
      });
  }

  /** Filtros locales */
  applyFilters(): void {
    const term = (this.searchTerm || '').toLowerCase().trim();

    this.filtered = this.autoevaluaciones.filter(a =>
      (a.nombreComercial || '').toLowerCase().includes(term) ||
      (a.categorias || '').toLowerCase().includes(term) ||
      (a.tipo || '').toLowerCase().includes(term)
    );

    this.computePaginationInfo();
  }

  /** Paginar localmente */
  computePaginationInfo(): void {
    this.totalElements = this.filtered.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;

    // Asegurar que currentPage esté en rango válido
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);

    if (this.totalElements === 0) {
      this.startIndex = 0;
      this.endIndex = 0;
      return;
    }

    this.startIndex = this.currentPage * this.pageSize + 1;
    this.endIndex = Math.min(
      (this.currentPage + 1) * this.pageSize,
      this.totalElements
    );
  }

  /** Cambios de filtros */
  onFilterChange(): void {
    this.currentPage = 0;
    this.loadAutoevaluaciones();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
    this.computePaginationInfo();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.currentPage = 0;
    this.loadAutoevaluaciones();
  }

  /** PAGINACIÓN */
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.computePaginationInfo();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.computePaginationInfo();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.computePaginationInfo();
    }
  }

  /** Crear */
  crearAutoevaluacion(): void {
    this.router.navigate(['/admin/autoevaluacion/create']);
  }

  /** Editar 
  editarAutoevaluacion(a: Autoevaluacion): void {
    this.router.navigate(['/admin/autoevaluacion/edit', a.id]);
  }*/

  verAutoevaluacion(): void {
    this.dialog.open(AutoevaluacionDetalleModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      panelClass: 'rounded-xl'
    });
  }


  /** Obtener lista de categorías para chips */
  getCategorias(categorias: string | null | undefined): string[] {
    if (!categorias) return [];
    return categorias.split(',').map(c => c.trim());
  }
}
