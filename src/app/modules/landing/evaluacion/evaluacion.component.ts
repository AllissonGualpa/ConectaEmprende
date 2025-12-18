import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmprendimientoService, EmprendimientoPublico } from '../../emprendimiento.service';
import { EnviarValoracionDto, FormularioDto, PreguntaDto, RespuestaDto, ValoracionService } from '../valoracion.service';

@Component({
  selector: 'app-evaluacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.css']
})
export class EvaluacionComponent implements OnInit {
  
  formularioValoracion!: FormGroup;
  formularioData: FormularioDto | null = null;
  emprendimiento: EmprendimientoPublico | null = null;
  
  cargando = true;
  enviando = false;
  error: string | null = null;
  
  idEmprendimiento: number | null = null;
  tipoFormulario: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO' | null = null;

  // Iconos de emojis para las escalas
  emojis = [
    { icon: 'sentiment_very_dissatisfied', color: 'text-red-500' },
    { icon: 'sentiment_dissatisfied', color: 'text-yellow-500' },
    { icon: 'sentiment_neutral', color: 'text-yellow-400' },
    { icon: 'sentiment_satisfied', color: 'text-blue-500' },
    { icon: 'sentiment_very_satisfied', color: 'text-green-500' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private valoracionService: ValoracionService,
    private emprendimientoService: EmprendimientoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener el ID del emprendimiento desde la URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID de emprendimiento no encontrado.';
      this.cargando = false;
      return;
    }

    this.idEmprendimiento = +id;
    this.cargarEmprendimientoYFormulario();
  }

  cargarEmprendimientoYFormulario(): void {
    if (!this.idEmprendimiento) return;

    // Primero obtenemos los datos del emprendimiento para saber su tipo
    this.emprendimientoService.getEmprendimientoPublico(this.idEmprendimiento).subscribe({
      next: (emprendimiento) => {
        this.emprendimiento = emprendimiento;
        
        // Determinar el tipo de formulario basado en el tipo de emprendimiento
        const tipo = emprendimiento?.nombreTipoEmprendimiento?.toLowerCase() || '';
        
        // Si contiene "producto" -> EVALUACION_PRODUCTO, sino -> EVALUACION_SERVICIO
        this.tipoFormulario = tipo.includes('producto') 
          ? 'EVALUACION_PRODUCTO' 
          : 'EVALUACION_SERVICIO';

        // Ahora cargamos el formulario correspondiente
        this.cargarFormulario();
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = 'No se pudo cargar la información del emprendimiento.';
        this.cargando = false;
      }
    });
  }

  cargarFormulario(): void {
    if (!this.tipoFormulario) return;

    this.valoracionService.getFormularioByTipo(this.tipoFormulario).subscribe({
      next: (formulario) => {
        this.formularioData = formulario;
        this.construirFormulario();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar formulario:', err);
        this.error = 'No se pudo cargar el formulario de valoración.';
        this.cargando = false;
      }
    });
  }

  construirFormulario(): void {
    if (!this.formularioData) return;

    const group: any = {};

    // Crear un control para cada pregunta
    this.formularioData.preguntas.forEach(pregunta => {
      const validators = pregunta.obligatoria ? [Validators.required] : [];
      group[`pregunta_${pregunta.idPregunta}`] = [null, validators];
    });

    this.formularioValoracion = this.fb.group(group);
  }

  // Método para obtener el rango de valores de una pregunta tipo escala
  getRango(pregunta: PreguntaDto): number[] {
    return Array.from({ length: pregunta.numeroRespuestas }, (_, i) => i + 1);
  }

  // Método para seleccionar un valor
  seleccionar(idPregunta: number, valor: number): void {
    this.formularioValoracion.patchValue({
      [`pregunta_${idPregunta}`]: valor
    });
  }

  // Verificar si un valor está seleccionado
  estaSeleccionado(idPregunta: number, valor: number): boolean {
    return this.formularioValoracion.get(`pregunta_${idPregunta}`)?.value === valor;
  }

  // Obtener el emoji correspondiente al índice (1-5)
  getEmoji(index: number) {
    return this.emojis[index - 1] || this.emojis[2];
  }

  enviar(): void {
    if (this.formularioValoracion.invalid) {
      this.snackBar.open('Por favor complete todas las preguntas obligatorias', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.formularioData || !this.idEmprendimiento) return;

    this.enviando = true;

    // Construir el array de respuestas
    const respuestas: RespuestaDto[] = this.formularioData.preguntas.map(pregunta => ({
      idPregunta: pregunta.idPregunta,
      respuesta: this.formularioValoracion.get(`pregunta_${pregunta.idPregunta}`)?.value
    }));

    const payload: EnviarValoracionDto = {
      idFormulario: this.formularioData.idFormulario,
      idEmprendimiento: this.idEmprendimiento,
      respuestas
    };

    /**this.valoracionService.enviarValoracion(payload).subscribe({
      next: () => {
        this.snackBar.open('¡Gracias por tu valoración!', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        
        // Redirigir o resetear después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/emprendimientos', this.idEmprendimiento]);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al enviar valoración:', err);
        this.snackBar.open('Error al enviar la valoración. Intenta nuevamente.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.enviando = false;
      }
    });
  }*/
  }
  getTituloFormulario(): string {
    if (!this.emprendimiento) return 'Encuesta de valoración';
    
    return this.tipoFormulario === 'EVALUACION_PRODUCTO'
      ? 'Evaluación de Producto'
      : 'Evaluación de Servicio';
  }
  // evaluacion.component.ts
hasEscala5(): boolean {
  return this.formularioData?.preguntas?.some(
    p => p.tipo === 'ESCALA' && p.numeroRespuestas === 5
  ) ?? false;
}

}