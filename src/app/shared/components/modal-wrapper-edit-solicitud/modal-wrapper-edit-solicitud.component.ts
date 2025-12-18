import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditSolicitudEmprendimientoComponent } from '../../../modules/emprendedor/gestion-emprendedor/edit-solicitud-emprendimiento/edit-solicitud-emprendimiento.component';

@Component({
  selector: 'app-modal-wrapper-edit-solicitud',
  standalone: true,
  imports: [CommonModule, EditSolicitudEmprendimientoComponent],
  templateUrl: './modal-wrapper-edit-solicitud.component.html',
})
export class ModalWrapperEditSolicitudComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalWrapperEditSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { emprendimientoId: number; soloLectura: boolean }
  ) {}

  // cerrar desde el wrapper (botón superior)
  close() {
    this.dialogRef.close();
  }

  // cerrar cuando el hijo emite (si lo hace)
  onChildClose() {
    this.dialogRef.close();
  }
}
