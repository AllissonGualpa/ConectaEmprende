import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ValoracionService } from '../../../../core/services/valoracion.service';
import { OpcionRespuestaDTO } from '../../../../core/types/valoracion.types';
import { Subject, takeUntil } from 'rxjs';

interface RespuestaAgrupada {
  idPregunta: number;
  pregunta: string;
  opciones: { idOpcion: number; opcion: string; }[];
  valorescala: number | null;
}

@Component({
  selector: 'app-autoevaluacion-detalle-modal',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './autoevaluacion-detalle-modal.component.html'
})
export class AutoevaluacionDetalleModalComponent implements OnInit, OnDestroy {
  
  respuestasAgrupadas: RespuestaAgrupada[] = [];
  nombreEmprendimiento: string = '';
  loading = false;
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      idAutoevaluacion: number, 
      nombreEmprendimiento: string 
    },
    private dialogRef: MatDialogRef<AutoevaluacionDetalleModalComponent>,
    private _valoracionService: ValoracionService
  ) {
    this.nombreEmprendimiento = data.nombreEmprendimiento;
  }

  ngOnInit(): void {
    this.cargarDetalle();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  cargarDetalle(page: number = 0): void {
    this.loading = true;
    this._valoracionService
      .obtenerDetalleAutoevaluacion(this.data.idAutoevaluacion, page, this.pageSize)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          // Agrupar respuestas por pregunta
          this.respuestasAgrupadas = this.agruparRespuestas(response.content);
          this.currentPage = response.pageable.page;
          this.totalPages = response.pageable.lastPage + 1;
          this.totalElements = response.pageable.length;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalle:', error);
          this.loading = false;
        }
      });
  }

  agruparRespuestas(respuestas: OpcionRespuestaDTO[]): RespuestaAgrupada[] {
    const mapaRespuestas = new Map<number, RespuestaAgrupada>();

    respuestas.forEach(resp => {
      if (!mapaRespuestas.has(resp.idPregunta)) {
        mapaRespuestas.set(resp.idPregunta, {
          idPregunta: resp.idPregunta,
          pregunta: resp.pregunta,
          opciones: [],
          valorescala: resp.valorescala || null
        });
      }

      const respuestaAgrupada = mapaRespuestas.get(resp.idPregunta)!;
      
      // Agregar opciones si existen
      if (resp.opciones && resp.opciones.length > 0) {
        resp.opciones.forEach(opcion => {
          // Evitar duplicados
          if (!respuestaAgrupada.opciones.find(o => o.idOpcion === opcion.idOpcion)) {
            respuestaAgrupada.opciones.push(opcion);
          }
        });
      }
    });

    return Array.from(mapaRespuestas.values());
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.cargarDetalle(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.cargarDetalle(this.currentPage + 1);
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}