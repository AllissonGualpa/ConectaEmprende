import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioDto, PreguntaDto, ValoracionService } from '../valoracion.service';

@Component({
  selector: 'app-valoracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './valoracion.component.html',
})
export class ValoracionComponent implements OnInit {
  formularioData: FormularioDto | null = null;
  valoracionForm!: FormGroup;
  cargando = true;
  error = '';
  enviando = false;
  enviado = false;
  
  idEmprendimiento?: number;
  idEvento?: number;
  tipoFormulario: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO' = 'EVALUACION_SERVICIO';

  // Para mostrar satisfacción general
  satisfaccionGeneral: 'insatisfecho' | 'neutral' | 'satisfecho' | null = null;

  constructor(
    private fb: FormBuilder,
    private valoracionService: ValoracionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la ruta
    this.route.params.subscribe(params => {
      this.idEmprendimiento = params['id'] ? +params['id'] : undefined;
      this.idEvento = params['idEvento'] ? +params['idEvento'] : undefined;
    });

    // Obtener tipo de formulario desde query params o determinar por defecto
    this.route.queryParams.subscribe(queryParams => {
      this.tipoFormulario = queryParams['tipo'] || 'EVALUACION_SERVICIO';
      this.cargarFormulario();
    });
  }

  cargarFormulario(): void {
    this.cargando = true;
    this.valoracionService.getFormularioByTipo(this.tipoFormulario).subscribe({
      next: (data) => {
        this.formularioData = data;
        this.inicializarFormulario();
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el formulario de valoración';
        this.cargando = false;
      }
    });
  }

  inicializarFormulario(): void {
    if (!this.formularioData) return;

    const group: any = {};
    
    this.formularioData.preguntas.forEach(pregunta => {
      const validators = pregunta.obligatoria ? [Validators.required] : [];
      group[`pregunta_${pregunta.idPregunta}`] = [null, validators];
    });

    this.valoracionForm = this.fb.group(group);
  }

  seleccionarRespuesta(idPregunta: number, valor: number): void {
    const controlName = `pregunta_${idPregunta}`;
    this.valoracionForm.get(controlName)?.setValue(valor);
    this.actualizarSatisfaccionGeneral();
  }

  estaSeleccionado(idPregunta: number, valor: number): boolean {
    const controlName = `pregunta_${idPregunta}`;
    return this.valoracionForm.get(controlName)?.value === valor;
  }

  actualizarSatisfaccionGeneral(): void {
    if (!this.formularioData) return;

    const valores = this.formularioData.preguntas
      .map(p => this.valoracionForm.get(`pregunta_${p.idPregunta}`)?.value)
      .filter(v => v !== null);

    if (valores.length === 0) {
      this.satisfaccionGeneral = null;
      return;
    }

    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
    
    if (promedio <= 2.5) {
      this.satisfaccionGeneral = 'insatisfecho';
    } else if (promedio <= 3.5) {
      this.satisfaccionGeneral = 'neutral';
    } else {
      this.satisfaccionGeneral = 'satisfecho';
    }
  }

  enviarValoracion(): void {
    if (this.valoracionForm.invalid) {
      Object.keys(this.valoracionForm.controls).forEach(key => {
        this.valoracionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.enviando = true;

    const respuestas = this.formularioData!.preguntas.map(pregunta => ({
      idPregunta: pregunta.idPregunta,
      respuesta: this.valoracionForm.get(`pregunta_${pregunta.idPregunta}`)?.value
    }));

    const payload = {
      idFormulario: this.formularioData!.idFormulario,
      idEmprendimiento: this.idEmprendimiento,
      idEvento: this.idEvento,
      respuestas
    };

    /**this.valoracionService.enviarValoracion(payload).subscribe({
      next: () => {
        this.enviado = true;
        this.enviando = false;
      },
      error: (err) => {
        this.error = 'Error al enviar la valoración. Por favor, intenta nuevamente.';
        this.enviando = false;
        console.error('Error al enviar valoración:', err);
      }
    });*/
  }

  obtenerEtiquetaEscala(pregunta: PreguntaDto, valor: number): string {
    // Para escalas de 5
    if (pregunta.numeroRespuestas === 5) {
      const etiquetas = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
      return etiquetas[valor - 1] || '';
    }
    
    // Para NPS (escala de 10)
    if (pregunta.numeroRespuestas === 10) {
      if (valor <= 6) return 'Detractor';
      if (valor <= 8) return 'Pasivo';
      return 'Promotor';
    }
    
    return '';
  }

  getArrayFromNumber(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  tieneEscalaCinco(): boolean {
    return this.formularioData?.preguntas.some(p => p.numeroRespuestas === 5) || false;
  }
}