import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface EventoDeleteData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-evento-delete',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './evento-delete.component.html',
  styleUrl: './evento-delete.component.css'
})
export class EventoDeleteComponent {
  constructor(private dialogRef: MatDialogRef<EventoDeleteComponent>, @Inject(MAT_DIALOG_DATA) public data: EventoDeleteData) {}

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
