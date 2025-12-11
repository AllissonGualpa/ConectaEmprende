import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EditarPerfilData {
  nombre: string;
  apellido: string;
  genero: 'Masculino' | 'Femenino' | 'Otro' | '';
  correo: string;
  fechaNacimiento: string; // ISO
}

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css'],
})
export class EditarPerfilComponent implements OnChanges {
  @Input() data!: EditarPerfilData;
  @Output() save = new EventEmitter<EditarPerfilData>();
  @Output() cancel = new EventEmitter<void>();

  // campo auxiliar para el <input type="date"> (yyyy-MM-dd)
  fechaNacimientoDate = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.fechaNacimiento) {
      const d = new Date(this.data.fechaNacimiento);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        this.fechaNacimientoDate = `${y}-${m}-${day}`;
      } else {
        this.fechaNacimientoDate = '';
      }
    }
  }

  onFechaNacimientoChange(value: string): void {
    this.fechaNacimientoDate = value;
    if (value) {
      const d = new Date(value);
      this.data.fechaNacimiento = d.toISOString();
    } else {
      this.data.fechaNacimiento = '';
    }
  }

  onSave(): void {
    this.save.emit({ ...this.data });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
