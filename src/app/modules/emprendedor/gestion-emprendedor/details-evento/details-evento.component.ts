import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EventoService } from '../../../admin/evento.service';
import { EmprendimientoSelectorComponent } from '../../../../shared/components/emprendimiento-selector/emprendimiento-selector.component';

export interface EventoDialogData {
  mode: 'create' | 'edit';
  evento?: any;
}

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    EmprendimientoSelectorComponent
  ],
  templateUrl: './details-evento.component.html'
})
export class DetailsEventoComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  eventoForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  imagenPreviewUrl: string | null = null;
  selectedImageFile: File | null = null;

  tiposEvento = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DetailsEventoComponent>,
    private eventoService: EventoService,
    @Inject(MAT_DIALOG_DATA) public data: EventoDialogData
  ) {
    this.isEditMode = this.data?.mode === 'edit';
    
    this.eventoForm = this.fb.group({
      idEmprendimiento: [null, Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      fechaEvento: [null, Validators.required],
      horaInicio: ['', Validators.required],
      tipoEvento: ['presencial', Validators.required],
      lugar: [''],
      linkInscripcion: [''],
      imagen: [null]
    });

    // Validación condicional: si es presencial, el lugar es requerido
    this.eventoForm.get('tipoEvento')?.valueChanges.subscribe(tipo => {
      const lugarControl = this.eventoForm.get('lugar');
      if (tipo === 'presencial') {
        lugarControl?.setValidators([Validators.required]);
      } else {
        lugarControl?.clearValidators();
      }
      lugarControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.evento) {
      this.loadEventoData();
    }
  }

  /**
   * Carga los datos del evento para modo edición
   */
  private loadEventoData(): void {
    this.isLoading = true;
    const idEvento = this.data.evento.idEvento || this.data.evento.id;

    this.eventoService.getEmprendedorEventById(idEvento).subscribe({
      next: (evento) => {
        // Parsear fecha y hora
        let fechaEvento = null;
        let horaInicio = '';

        if (evento.fechaEvento) {
          const fechaDate = new Date(evento.fechaEvento);
          fechaEvento = fechaDate;
          
          // Extraer hora en formato HH:mm
          const hours = fechaDate.getHours().toString().padStart(2, '0');
          const minutes = fechaDate.getMinutes().toString().padStart(2, '0');
          horaInicio = `${hours}:${minutes}`;
        }

        // Mapear datos al formulario
        this.eventoForm.patchValue({
          idEmprendimiento: evento.idEmprendimiento,
          titulo: evento.titulo || '',
          descripcion: evento.descripcion || '',
          fechaEvento: fechaEvento,
          horaInicio: horaInicio,
          tipoEvento: evento.tipoEvento?.toLowerCase() || 'presencial',
          lugar: evento.lugar || evento.direccion || '',
          linkInscripcion: evento.linkInscripcion || ''
        });

        // Cargar imagen si existe
        if (evento.urlMultimedia) {
          this.imagenPreviewUrl = evento.urlMultimedia;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando evento:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Maneja la selección de archivo de imagen
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    this.selectedImageFile = file;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Elimina la imagen seleccionada
   */
  removeImage(): void {
    this.selectedImageFile = null;
    this.imagenPreviewUrl = null;
    this.eventoForm.patchValue({ imagen: null });
  }

  /**
   * Trigger del input file
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Guarda el evento (crear o editar)
   */
  onSubmit(): void {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Construir la fecha completa en formato ISO
    const formValue = this.eventoForm.value;
    const fechaEvento = this.buildFechaEvento(
      formValue.fechaEvento,
      formValue.horaInicio
    );

    if (this.isEditMode) {
      this.updateEvento(fechaEvento);
    } else {
      this.createEvento(fechaEvento);
    }
  }

  /**
   * Construye la fecha en formato ISO
   */
  private buildFechaEvento(fecha: Date, hora: string): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const time = hora || '00:00';
    const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
    
    return `${year}-${month}-${day}T${timeWithSeconds}`;
  }

  /**
   * Crea un nuevo evento
   */
  private createEvento(fechaEvento: string): void {
    const formValue = this.eventoForm.value;
    
    // Si hay imagen, enviar como FormData
    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('titulo', formValue.titulo);
      formData.append('descripcion', formValue.descripcion);
      formData.append('fechaEvento', fechaEvento);
      formData.append('lugar', formValue.lugar || 'Online');
      formData.append('tipoEvento', formValue.tipoEvento);
      formData.append('linkInscripcion', formValue.linkInscripcion || '');
      formData.append('activo', 'true');
      formData.append('imagen', this.selectedImageFile, this.selectedImageFile.name);

      this.eventoService.createEvent(formData, {
        idEmprendimiento: formValue.idEmprendimiento,
        isFormData: true
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error creando evento:', error);
          this.isLoading = false;
          alert('Error al crear el evento. Por favor intenta nuevamente.');
        }
      });
    } else {
      // Sin imagen, enviar como JSON
      const payload = {
        titulo: formValue.titulo,
        descripcion: formValue.descripcion,
        fechaEvento: fechaEvento,
        lugar: formValue.lugar || 'Online',
        tipoEvento: formValue.tipoEvento,
        linkInscripcion: formValue.linkInscripcion || '',
        activo: true
      };

      this.eventoService.createEvent(payload, {
        idEmprendimiento: formValue.idEmprendimiento,
        isFormData: false
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error creando evento:', error);
          this.isLoading = false;
          alert('Error al crear el evento. Por favor intenta nuevamente.');
        }
      });
    }
  }

  /**
   * Actualiza un evento existente
   */
private updateEvento(fechaEvento: string): void {
  const formValue = this.eventoForm.value;
  const idEvento = this.data.evento.idEvento || this.data.evento.id;

  const formData = new FormData();
  formData.append('titulo', formValue.titulo);
  formData.append('descripcion', formValue.descripcion);
  formData.append('fechaEvento', fechaEvento);
  formData.append('lugar', formValue.lugar || 'Online');
  formData.append('tipoEvento', formValue.tipoEvento);
  formData.append('linkInscripcion', formValue.linkInscripcion || '');
  formData.append('activo', 'true');

  // Solo si hay imagen nueva
  if (this.selectedImageFile) {
    formData.append('imagen', this.selectedImageFile, this.selectedImageFile.name);
  }

  this.eventoService.editEvent(idEvento, formData, {
    isFormData: true
  }).subscribe({
    next: (response) => {
      this.isLoading = false;
      this.dialogRef.close(response);
    },
    error: (error) => {
      console.error('Error actualizando evento:', error);
      this.isLoading = false;
      alert('Error al actualizar el evento. Por favor intenta nuevamente.');
    }
  });
}

  /**
   * Cierra el diálogo sin guardar
   */
  onCancel(): void {
    this.dialogRef.close(null);
  }

  /**
   * Getter para facilitar acceso a los controles del formulario
   */
  get f() {
    return this.eventoForm.controls;
  }
}