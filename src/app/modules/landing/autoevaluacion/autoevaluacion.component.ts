import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormularioDto, PreguntaDto, ValoracionService } from '../valoracion.service';

@Component({
  selector: 'app-autoevaluacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './autoevaluacion.component.html',
})
export class AutoevaluacionComponent implements OnInit {
  formulario!: FormGroup;
  formularioData: FormularioDto | null = null;
  currentStep = 0;
  idEmprendimiento: number;
  isLoading = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private valoracionService: ValoracionService,
    public dialogRef: MatDialogRef<AutoevaluacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idEmprendimiento: number }
  ) {
    this.idEmprendimiento = data.idEmprendimiento;
  }

  ngOnInit(): void {
    this.cargarFormulario();
  }

  cargarFormulario(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.valoracionService.getFormularioByTipo('AUTOEVALUACION').subscribe({
      next: (formulario) => {
        this.formularioData = formulario;
        this.initForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el formulario:', error);
        this.errorMessage = 'No se pudo cargar el formulario. Por favor intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  initForm(): void {
    if (!this.formularioData) return;

    const group: any = {};
    
    this.formularioData.preguntas.forEach((pregunta) => {
      if (pregunta.tipo === 'SELECCION_MULTIPLE') {
        // Para selección múltiple usamos FormArray
        group[`pregunta_${pregunta.idPregunta}`] = this.fb.array(
          [],
          [Validators.required, this.maxSelectionsValidator(pregunta.numeroRespuestas)]
        );
      } else if (pregunta.tipo === 'ESCALA') {
        // Para escalas usamos FormControl simple
        group[`pregunta_${pregunta.idPregunta}`] = this.fb.control(
          null,
          pregunta.obligatoria ? [Validators.required] : []
        );
      } else if (pregunta.tipo === 'TEXTO_LIBRE') {
        // Para texto libre
        group[`pregunta_${pregunta.idPregunta}`] = this.fb.control(
          '',
          pregunta.obligatoria ? [Validators.required, Validators.minLength(3)] : []
        );
      }
    });

    this.formulario = this.fb.group(group);
  }

  maxSelectionsValidator(max: number) {
    return (control: any) => {
      const selections = control.value || [];
      if (selections.length === 0) {
        return { required: true };
      }
      if (selections.length > max) {
        return { maxSelections: { max, actual: selections.length } };
      }
      return null;
    };
  }

  getCurrentPregunta(): PreguntaDto | null {
    if (!this.formularioData) return null;
    return this.formularioData.preguntas[this.currentStep];
  }

  getFormArray(preguntaId: number): FormArray {
    return this.formulario.get(`pregunta_${preguntaId}`) as FormArray;
  }

  getFormControl(preguntaId: number) {
    return this.formulario.get(`pregunta_${preguntaId}`);
  }

  isOptionSelected(preguntaId: number, opcionId: number): boolean {
    const pregunta = this.getCurrentPregunta();
    if (!pregunta) return false;

    if (pregunta.tipo === 'SELECCION_MULTIPLE') {
      const formArray = this.getFormArray(preguntaId);
      return formArray.value.includes(opcionId);
    } else if (pregunta.tipo === 'ESCALA') {
      const control = this.getFormControl(preguntaId);
      return control?.value === opcionId;
    }
    return false;
  }

  toggleOption(preguntaId: number, opcionId: number): void {
    const pregunta = this.getCurrentPregunta();
    if (!pregunta) return;

    if (pregunta.tipo === 'SELECCION_MULTIPLE') {
      const formArray = this.getFormArray(preguntaId);
      const currentValue = formArray.value;
      const index = currentValue.indexOf(opcionId);

      if (index > -1) {
        // Deseleccionar
        const newValue = currentValue.filter((id: number) => id !== opcionId);
        formArray.setValue(newValue);
      } else {
        // Seleccionar
        if (currentValue.length < pregunta.numeroRespuestas) {
          formArray.setValue([...currentValue, opcionId]);
        }
      }
      formArray.markAsTouched();
    } else if (pregunta.tipo === 'ESCALA') {
      const control = this.getFormControl(preguntaId);
      control?.setValue(opcionId);
      control?.markAsTouched();
    }
  }

  canGoNext(): boolean {
    const pregunta = this.getCurrentPregunta();
    if (!pregunta) return false;
    
    const controlName = `pregunta_${pregunta.idPregunta}`;
    const control = this.formulario.get(controlName);
    
    return control ? control.valid : false;
  }

  siguiente(): void {
    if (!this.formularioData) return;
    
    if (this.currentStep < this.formularioData.preguntas.length - 1) {
      this.currentStep++;
    } else {
      this.enviar();
    }
  }

  anterior(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  enviar(): void {
    if (!this.formulario.valid || !this.formularioData) return;

    const respuestasFormateadas = this.formularioData.preguntas.map(pregunta => {
      const controlName = `pregunta_${pregunta.idPregunta}`;
      const valor = this.formulario.get(controlName)?.value;

      let respuesta: string | number;

      if (pregunta.tipo === 'SELECCION_MULTIPLE') {
        // Array de IDs seleccionados → String separado por comas
        respuesta = Array.isArray(valor) ? valor.join(',') : '';
      } else if (pregunta.tipo === 'ESCALA') {
        // Número de la opción seleccionada
        respuesta = valor || 0;
      } else {
        // TEXTO_LIBRE
        respuesta = valor || '';
      }

      return {
        idPregunta: pregunta.idPregunta,
        respuesta
      };
    });

    const payload = {
      idFormulario: this.formularioData.idFormulario,
      idEmprendimiento: this.idEmprendimiento,
      respuestas: respuestasFormateadas
    };

    this.dialogRef.close({ payload });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  reintentar(): void {
    this.cargarFormulario();
  }
}