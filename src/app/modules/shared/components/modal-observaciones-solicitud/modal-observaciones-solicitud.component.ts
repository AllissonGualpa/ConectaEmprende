import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ModalObservacionesData {
  tipo: 'rechazar' | 'observaciones'; // Tipo de acción
  solicitudId: number;
  nombreEmprendimiento?: string;
}

@Component({
  selector: 'app-modal-observaciones-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './modal-observaciones-solicitud.component.html',
})
export class ModalObservacionesSolicitudComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalObservacionesSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalObservacionesData
  ) {
    this.form = this.fb.group({
      texto: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]]
    });
  }

  get titulo(): string {
    return this.data.tipo === 'rechazar' 
      ? 'Rechazar Solicitud' 
      : 'Enviar Observaciones';
  }

  get subtitulo(): string {
    return this.data.tipo === 'rechazar'
      ? 'Proporciona el motivo del rechazo'
      : 'Indica las correcciones necesarias';
  }

  get placeholderTexto(): string {
    return this.data.tipo === 'rechazar'
      ? 'Ej: La documentación presentada no cumple con los requisitos...'
      : 'Ej: Por favor corrige la sección de descripción del emprendimiento...';
  }

  get labelTexto(): string {
    return this.data.tipo === 'rechazar' ? 'Motivo del rechazo' : 'Observaciones';
  }

  get iconoColor(): string {
    return this.data.tipo === 'rechazar' ? 'text-red-500' : 'text-orange-500';
  }

  get icono(): string {
    return this.data.tipo === 'rechazar' ? 'cancel' : 'comment';
  }

  get textoControl() {
    return this.form.get('texto');
  }

  get caracteresRestantes(): number {
    const texto = this.textoControl?.value || '';
    return 500 - texto.length;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const resultado = {
      tipo: this.data.tipo,
      texto: this.textoControl?.value.trim()
    };

    this.dialogRef.close(resultado);
  }

  getErrorMessage(): string | null {
    if (this.textoControl?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (this.textoControl?.hasError('minlength')) {
      const minLength = this.textoControl.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (this.textoControl?.hasError('maxlength')) {
      return 'Máximo 500 caracteres';
    }
    return null;
  }
}