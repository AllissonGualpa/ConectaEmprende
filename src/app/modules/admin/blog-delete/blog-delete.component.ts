import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-blog-delete',
  templateUrl: './blog-delete.component.html',
  styleUrls: ['./blog-delete.component.css']
})
export class BlogDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<BlogDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string }
  ) {}

  cancelar(): void {
    this.dialogRef.close(false); // Cierra el modal sin confirmar
  }

  confirmar(): void {
    this.dialogRef.close(true); // Cierra el modal confirmando
  }
}
