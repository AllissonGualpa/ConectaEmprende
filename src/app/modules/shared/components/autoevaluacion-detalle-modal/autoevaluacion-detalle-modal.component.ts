import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-autoevaluacion-detalle-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './autoevaluacion-detalle-modal.component.html'
})
export class AutoevaluacionDetalleModalComponent {

  constructor(
    private dialogRef: MatDialogRef<AutoevaluacionDetalleModalComponent>
  ) {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
