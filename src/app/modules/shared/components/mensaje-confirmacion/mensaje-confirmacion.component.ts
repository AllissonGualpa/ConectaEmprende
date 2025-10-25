import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  subject?: string; // e.g. 'Evento' — used to build default title
  title?: string; // optional full title override
  subtitle?: string; // optional subtitle text
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

  constructor(public dialogRef: MatDialogRef<MensajeConfirmacionComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {
    const subject = data?.subject || 'Elemento';
    this.title = data?.title ?? `${subject} creado exitosamente`;
    this.subtitle = data?.subtitle ?? '';
  }

  close() {
    this.dialogRef.close(true);
  }
}
