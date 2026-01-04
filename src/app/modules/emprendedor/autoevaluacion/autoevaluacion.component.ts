import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Formulario, Pregunta } from '../../../core/types/formulario.types';
import { FormulariosService } from '../../../core/services/formulario.service';
import { ValoracionService } from '../../../core/services/valoracion.service';
import { OpcionRespuestaRequestDTO } from '../../../core/types/valoracion.types';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-autoevaluacion',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule,
        MatProgressBarModule,
        MatButtonModule,
        MatRadioModule,
        MatCheckboxModule,
        MatCardModule,
        MatIconModule,
        MatDialogModule  
    ],
    templateUrl: './autoevaluacion.component.html'
})
export class AutoevaluacionComponent implements OnInit, OnDestroy {
    formulario: Formulario | null = null;
    preguntaActualIndex: number = 0;
    preguntaActual: Pregunta | null = null;
    respuestaForm: FormGroup;
    respuestas: Map<number, any> = new Map();
    
    idEmprendimiento: number;
    idRespuestaValoracion: number;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _formulariosService: FormulariosService,
        private _valoracionService: ValoracionService,
        private _formBuilder: FormBuilder,
        private _route: ActivatedRoute,
        private _router: Router,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: { idEmprendimiento: number, idRespuestaValoracion: number },
        @Optional() public dialogRef: MatDialogRef<AutoevaluacionComponent>
    ) {
        // Si viene de dialog, usar data, si no usar route params
        this.idEmprendimiento = this.data?.idEmprendimiento || Number(this._route.snapshot.paramMap.get('idEmprendimiento'));
        this.idRespuestaValoracion = this.data?.idRespuestaValoracion || Number(this._route.snapshot.paramMap.get('idRespuestaValoracion'));
        
        this.respuestaForm = this._formBuilder.group({
            respuesta: ['', Validators.required],
            opcionesMultiples: this._formBuilder.array([])
        });
    }

    get opcionesMultiples(): FormArray {
        return this.respuestaForm.get('opcionesMultiples') as FormArray;
    }

    ngOnInit(): void {
        this.cargarFormulario();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this._formulariosService.resetFormularioActual();
    }

    cargarFormulario(): void {
        this._formulariosService
            .obtenerFormularioPorTipo('AUTOEVALUACION')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (formulario) => {
                    this.formulario = formulario;
                    if (formulario.preguntas && formulario.preguntas.length > 0) {
                        this.preguntaActual = formulario.preguntas[0];
                        this.configurarFormularioSegunTipo();
                    }
                },
                error: (error) => {
                    console.error('Error al cargar el formulario:', error);
                }
            });
    }

    configurarFormularioSegunTipo(): void {
        if (!this.preguntaActual) return;

        this.opcionesMultiples.clear();
        this.respuestaForm.patchValue({ respuesta: '' });

        if (this.preguntaActual.tipo === 'MULTIPLE' && this.preguntaActual.opciones) {
            this.preguntaActual.opciones.forEach(() => {
                this.opcionesMultiples.push(new FormControl(false));
            });
        }
    }

    onCheckboxChange(index: number): void {
        if (!this.preguntaActual) return;

        const seleccionadas = this.opcionesMultiples.controls
            .map((control, i) => control.value ? this.preguntaActual!.opciones![i].idOpcion : null)
            .filter(id => id !== null);

        if (seleccionadas.length >= 1) {
            this.respuestaForm.patchValue({ respuesta: seleccionadas });
        } else {
            this.respuestaForm.patchValue({ respuesta: '' });
        }

        // Limitar el número de selecciones
        const checkedCount = this.opcionesMultiples.controls.filter(c => c.value).length;
        if (checkedCount >= this.preguntaActual.numeroRespuestas) {
            this.opcionesMultiples.controls.forEach((control, i) => {
                if (!control.value) {
                    control.disable();
                }
            });
        } else {
            this.opcionesMultiples.controls.forEach(control => control.enable());
        }
    }

    siguiente(): void {
        if (!this.respuestaForm.valid || !this.preguntaActual) return;

        // Guardar respuesta
        if (this.preguntaActual.tipo === 'MULTIPLE') {
            const seleccionadas = this.opcionesMultiples.controls
                .map((control, i) => control.value ? this.preguntaActual!.opciones![i].idOpcion : null)
                .filter(id => id !== null);
            this.respuestas.set(this.preguntaActual.idPregunta, seleccionadas);
        } else {
            this.respuestas.set(this.preguntaActual.idPregunta, this.respuestaForm.value.respuesta);
        }

        // Avanzar o finalizar
        if (this.preguntaActualIndex < (this.formulario?.preguntas.length || 0) - 1) {
            this.preguntaActualIndex++;
            this.preguntaActual = this.formulario!.preguntas[this.preguntaActualIndex];
            this.configurarFormularioSegunTipo();
        } else {
            this.enviarRespuestas();
        }
    }

    enviarRespuestas(): void {
        const respuestasArray: OpcionRespuestaRequestDTO[] = Array.from(this.respuestas.entries()).map(([idPregunta, respuesta]) => {
            const pregunta = this.formulario!.preguntas.find(p => p.idPregunta === idPregunta);
            
            // Determinar si es ESCALA o MULTIPLE
            const esEscala = pregunta?.tipo === 'ESCALA';
            
            return {
                idEmprendimiento: this.idEmprendimiento,
                idRespuesta: null,
                idRespuestaValoracion: this.idRespuestaValoracion,
                idsPregunta: idPregunta,
                idsOpciones: esEscala ? null : (Array.isArray(respuesta) ? respuesta : [respuesta]),
                valorescala: esEscala ? respuesta : null,
                tipoFormulario: 'AUTOEVALUACION'
            };
        });

        console.log('Enviando respuestas:', respuestasArray);
        
        this._valoracionService.guardarRespuestas(respuestasArray)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    console.log('Respuestas guardadas exitosamente:', response);
                    
                    // Cerrar el diálogo si está en modo diálogo
                    if (this.dialogRef) {
                        this.dialogRef.close({ success: true });
                    } else {
                        // Si está en ruta normal, navegar a otra página
                        this._router.navigate(['/emprendedor/gestion']);
                    }
                },
                error: (error) => {
                    console.error('Error al guardar respuestas:', error);
                    // Aquí puedes mostrar un mensaje de error al usuario
                }
            });
    }

    get progreso(): number {
        if (!this.formulario || !this.formulario.preguntas.length) return 0;
        return ((this.preguntaActualIndex + 1) / this.formulario.preguntas.length) * 100;
    }

    get esPrimeraPregunta(): boolean {
        return this.preguntaActualIndex === 0;
    }

    get esUltimaPregunta(): boolean {
        return this.preguntaActualIndex === (this.formulario?.preguntas.length || 0) - 1;
    }

    get esModoDialog(): boolean {
        return !!this.dialogRef;
    }

    cerrarDialog(): void {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}