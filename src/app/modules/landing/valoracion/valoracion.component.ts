import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { Formulario, Pregunta } from '../../../core/types/formulario.types';
import { FormulariosService } from '../../../core/services/formulario.service';
import { EmprendimientoService } from '../../../core/services/emprendimiento.service';
import { ValoracionService } from '../../../core/services/valoracion.service';
import { OpcionRespuestaRequestDTO } from '../../../core/types/valoracion.types';

@Component({
    selector: 'app-valoracion',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './valoracion.component.html',
})
export class ValoracionComponent implements OnInit, OnDestroy {
    formularioData: Formulario | null = null;
    valoracionForm!: FormGroup;
    cargando = true;
    error = '';
    enviando = false;
    enviado = false;

    idEmprendimiento!: number;
    tipoFormulario: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO' = 'EVALUACION_SERVICIO';
    nombreEmprendimiento = '';

    // Para mostrar satisfacción general
    satisfaccionGeneral: 'insatisfecho' | 'neutral' | 'satisfecho' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private fb: FormBuilder,
        private formulariosService: FormulariosService,
        private emprendimientoService: EmprendimientoService,
        private valoracionService: ValoracionService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Obtener ID de emprendimiento de los parámetros
        this.route.params
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(params => {
                    this.idEmprendimiento = +params['id'];

                    if (!this.idEmprendimiento) {
                        throw new Error('ID de emprendimiento no válido');
                    }

                    // Primero obtener los datos del emprendimiento para saber su tipo
                    return this.emprendimientoService.obtenerEmprendimientoPublico(this.idEmprendimiento);
                })
            )
            .subscribe({
                next: (emprendimiento) => {
                    this.nombreEmprendimiento = emprendimiento.nombreComercial || '';
                    
                    // Determinar el tipo de formulario basado en el tipo de emprendimiento
                    const tipoEmprendimiento = emprendimiento.nombreTipoEmprendimiento?.toLowerCase() || '';
                    
                    if (tipoEmprendimiento.includes('producto')) {
                        this.tipoFormulario = 'EVALUACION_PRODUCTO';
                    } else if (tipoEmprendimiento.includes('servicio')) {
                        this.tipoFormulario = 'EVALUACION_SERVICIO';
                    } else {
                        // Por defecto, si no está claro, usar servicio
                        this.tipoFormulario = 'EVALUACION_SERVICIO';
                        console.warn('Tipo de emprendimiento no reconocido:', tipoEmprendimiento);
                    }

                    console.log('Tipo de emprendimiento:', tipoEmprendimiento);
                    console.log('Formulario a cargar:', this.tipoFormulario);

                    // Ahora cargar el formulario correspondiente
                    this.cargarFormulario();
                },
                error: (err) => {
                    this.error = 'Error al cargar información del emprendimiento';
                    this.cargando = false;
                    console.error('Error:', err);
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this.formulariosService.resetFormularioActual();
    }

    cargarFormulario(): void {
        this.cargando = true;
        this.error = '';

        this.formulariosService
            .obtenerFormularioPorTipo(this.tipoFormulario)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (data) => {
                    this.formularioData = data;
                    this.inicializarFormulario();
                    this.cargando = false;
                },
                error: (err) => {
                    this.error = 'Error al cargar el formulario de valoración';
                    this.cargando = false;
                    console.error('Error:', err);
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
        this.error = '';

        // Construir el payload según el formato esperado por el backend
        const respuestas: OpcionRespuestaRequestDTO[] = this.formularioData!.preguntas.map(pregunta => {
            const valor = this.valoracionForm.get(`pregunta_${pregunta.idPregunta}`)?.value;
            
            return {
                idEmprendimiento: this.idEmprendimiento,
                idRespuesta: null,
                idRespuestaValoracion: null,
                idsPregunta: pregunta.idPregunta,
                idsOpciones: null, // Para valoraciones de escala no hay opciones
                valorescala: valor,
                tipoFormulario: this.tipoFormulario
            };
        });

        console.log('Payload a enviar:', respuestas);

        // Enviar al backend
        this.valoracionService.guardarRespuestas(respuestas)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('Valoración guardada exitosamente:', response);
                    this.enviado = true;
                    this.enviando = false;
                    
                    // Opcional: Redirigir después de unos segundos
                    // setTimeout(() => {
                    //     this.router.navigate(['/']);
                    // }, 3000);

                    setTimeout(() => {
                        this.router.navigate(['/emprendimientos', this.idEmprendimiento]);
                    }, 2000);
                },
                error: (err) => {
                    console.error('Error al enviar valoración:', err);
                    this.error = 'Error al enviar la valoración. Por favor, intenta nuevamente.';
                    this.enviando = false;
                }
            });
    }

    obtenerEtiquetaEscala(pregunta: Pregunta, valor: number): string {
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