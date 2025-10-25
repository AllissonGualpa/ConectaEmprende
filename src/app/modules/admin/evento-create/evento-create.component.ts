import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { EventoService } from '../evento.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-evento-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatSelectModule, HttpClientModule],
  templateUrl: './evento-create.component.html',
  styleUrl: './evento-create.component.css'
})


export class EventoCreateComponent {

  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<EventoCreateComponent>,private cdr: ChangeDetectorRef, private eventoService: EventoService, @Inject(MAT_DIALOG_DATA) public dialogData?: any) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha: [null, Validators.required],
      horaInicio: [''],
      horaFin: [''],
      tipo: ['VIRTUAL'],
      link: [''],
      direccion: ['Online'],
      imagen: [null],
      token: ['']
    });
  }
  ngAfterViewInit(): void {
    // 👇 Esto fuerza a Angular Material a recalcular estilos correctamente
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    // If dialog sent data for edit, prefill the form
    const data = this.dialogData;
    if (data && data.mode === 'edit' && data.event) {
      const e = data.event;
      // Map fields from existing event to the form where possible
      this.form.patchValue({
        nombre: e.nombre || '',
        descripcion: e.descripcion || '',
        link: e.linkInscripcion || '',
        direccion: e.direccion || (e.lugar || ''),
        tipo: (e.tipoEvento || e.tipo) || 'VIRTUAL'
      });

      //set fecha and horaInicio if available ('DD/MM/YYYY' or ISO)
      if (e.fecha) {
        // if format is DD/MM/YYYY convert to YYYY-MM-DD for date input
        const parts = String(e.fecha).split('/');
        if (parts.length === 3) {
          const d = parts[0].padStart(2, '0');
          const m = parts[1].padStart(2, '0');
          const y = parts[2];
          this.form.patchValue({ fecha: `${y}-${m}-${d}` });
        } else if (String(e.fecha).includes('T')) {
          this.form.patchValue({ fecha: String(e.fecha).split('T')[0] });
        } else {
          this.form.patchValue({ fecha: e.fecha });
        }
      }

      if (e.hora) {
        // try to extract HH:mm from '9:30 AM' style
        const match = String(e.hora).match(/(\d{1,2}:\d{2})/);
        if (match) this.form.patchValue({ horaInicio: match[1] });
      }
    }
  }


  crear() {
    if (this.form.valid) {
      this.loading = true;
      this.error = null;
      const f = this.form.value;

      // Mapear los campos del formulario a los nombres que espera la API
      // Construir fechaEvento en formato ISO completo (YYYY-MM-DDTHH:mm:SS)
      let fechaEvento: string | null = null;
      try {
        const fechaVal = f.fecha; // puede ser string 'YYYY-MM-DD' o Date
        const horaVal = f.horaInicio || '00:00';

        if (!fechaVal) {
          fechaEvento = null;
        } else {
          // si fechaVal ya contiene 'T' asumimos que es ISO completo
          if (typeof fechaVal === 'string' && fechaVal.includes('T')) {
            fechaEvento = fechaVal;
          } else {
            // Normalizar fecha string
            let datePart = '';
            if (fechaVal instanceof Date) {
              datePart = fechaVal.toISOString().slice(0, 10);
            } else {
              // fechaVal probablemente 'YYYY-MM-DD'
              datePart = String(fechaVal);
            }

            // Normalizar hora (HH:mm or HH:mm:ss)
            let timePart = String(horaVal);
            if (/^\d{2}:\d{2}$/.test(timePart)) {
              timePart = `${timePart}:00`;
            }

            fechaEvento = `${datePart}T${timePart}`;
          }
        }
      } catch (e) {
        fechaEvento = null;
      }

      const payload: any = {
        titulo: f.nombre,
        descripcion: f.descripcion,
        fechaEvento: fechaEvento,
        lugar: f.direccion || f.lugar || 'Online',
        tipoEvento: f.tipo || 'VIRTUAL',
        linkInscripcion: f.link || '',
        direccion: f.direccion || '',
        // idMultimedia: opcional, si el backend espera id en lugar de archivo
      };

  // Backend aún no maneja subida de archivos; usar idMultimedia quemado
  // No enviar archivo en el payload. El backend espera un idMultimedia (numérico).
  payload.idMultimedia = 1; // valor fijo según lo indicado

      // Try to retrieve token from localStorage if user didn't paste one
      let token = this.form.value.token;
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || '';
      }

      console.log('Enviar payload a createEvent:', payload);

      // If dialog is used in edit mode, call the API to update the event
      if (this.dialogData && this.dialogData.mode === 'edit') {
        this.error = null;
        const idEvento = this.dialogData.event?.id || this.dialogData.event?.idEvento;
        const idEmprendimiento = this.dialogData.event?.idEmprendimiento || 4;

        this.eventoService.editEvent(idEvento, idEmprendimiento, payload, { idMultimedia: 1, token: token || undefined }).subscribe({
          next: (res: any) => {
            this.loading = false;
            // Ensure we return an object that contains an `id` field so the caller can match the event
            const resId = res?.idEvento ? String(res.idEvento) : (res?.id ? String(res.id) : String(idEvento));
            const closeObj = { ...payload, ...res, id: resId };
            this.dialogRef.close(closeObj);
          },
          error: (err: any) => {
            this.loading = false;
            this.error = err?.message || 'Error actualizando evento';
          }
        });
        return;
      }

      this.eventoService.createEvent(payload, { idEmprendimiento: 4, token: token || undefined }).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err?.message || 'Error creando evento';
          // opcional: podríamos mantener el diálogo abierto para mostrar el error
        }
      });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.form.patchValue({ imagen: file });
    // For change detection if needed
    this.cdr.detectChanges();
  }

}
