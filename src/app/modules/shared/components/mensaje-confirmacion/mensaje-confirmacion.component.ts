import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  subject?: string;
  title?: string;
  subtitle?: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'confirm';
}

@Component({
  selector: 'app-mensaje-confirmacion',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './mensaje-confirmacion.component.html'
})
export class MensajeConfirmacionComponent {
  public title: string;
  public subtitle: string;
  public type: 'success' | 'error' | 'info' | 'warning' | 'confirm';

  constructor(
    public dialogRef: MatDialogRef<MensajeConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    const subject = data?.subject || 'Elemento';
    this.type = data?.type || 'success';

    if (data?.title) {
      this.title = data.title;
    } else {
      switch (this.type) {
        case 'success':
          this.title = `${subject} creado exitosamente`;
          break;
        case 'error':
          this.title = `Error al procesar ${subject}`;
          break;
        case 'info':
          this.title = `${subject} - información`;
          break;
        case 'warning':
          this.title = `Advertencia sobre ${subject}`;
          break;
        case 'confirm':
          this.title = `Confirmar acción`;
          break;
      }
    }

    this.subtitle = data?.subtitle ?? '';
  }

  close() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}