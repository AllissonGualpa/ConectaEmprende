import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';


export interface BlogDeleteData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-blog-delete',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './blog-delete.component.html',
  styleUrls: ['./blog-delete.component.css']
})
export class BlogDeleteComponent {
  constructor(
    private dialogRef: MatDialogRef<BlogDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BlogDeleteData
  ) {}

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
