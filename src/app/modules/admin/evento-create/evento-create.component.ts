import { Component, Inject, ChangeDetectorRef } from '@angular/core';
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
import { HttpClientModule } from '@angular/common/http';
import { EventoService } from '../evento.service';
import { MatDialog } from '@angular/material/dialog';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

@Component({
  selector: 'app-evento-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './evento-create.component.html',
  styleUrl: './evento-create.component.css'
})
export class EventoCreateComponent {

  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EventoCreateComponent>,
    private cdr: ChangeDetectorRef,
    private eventoService: EventoService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData?: any
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha: [null, Validators.required],
      horaInicio: [''],
      horaFin: [''],
      tipo: ['PRESENCIAL'],
      link: [''],
      direccion: [''],
      imagen: [null],
      activarEvento: [false],
      token: ['']
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    const data = this.dialogData;
    if (data && data.mode === 'edit' && data.event) {
      this.loading = true;
      const idEvento = data.event.id || data.event.idEvento;
      this.eventoService.getEventByIdAdmin(idEvento).subscribe({
        next: (e) => {
          // Mapear campos del evento a los del formulario
          const nombre = e.titulo || e.nombre || '';
          const descripcion = e.descripcion || '';
          const link = e.linkInscripcion || e.link || '';
          const direccion = e.direccion || e.lugar || '';

          // Extraer fecha y hora desde fechaEvento (ISO)
          let fecha: Date | string | null = null;
          let horaInicio: string | null = null;
          let horaFin: string | null = null;

          if (e.fechaEvento) {
            // e.g. "2025-10-10T18:08:00"
            const [fechaStr, horaStr] = String(e.fechaEvento).split('T');
            if (fechaStr) {
              fecha = new Date(e.fechaEvento);
              // Si el input date espera string yyyy-MM-dd, puedes usar fechaStr
              // fecha = fechaStr;
            }
            if (horaStr) {
              // Solo HH:mm
              horaInicio = horaStr.slice(0,5);
            }
          }

          // Si el backend provee horaFin, puedes mapearlo aquí
          if (e.horaFin) {
            horaFin = String(e.horaFin).slice(0,5);
          }

          let tipoVal = 'PRESENCIAL';
          const tipoRaw = (e.tipoEvento || e.tipo || '').toString().toLowerCase();
          if (tipoRaw.includes('pres')) tipoVal = 'PRESENCIAL';
          else if (tipoRaw.includes('onl') || tipoRaw.includes('vir') || tipoRaw.includes('virtual')) tipoVal = 'VIRTUAL';

          this.form.patchValue({
            nombre,
            descripcion,
            fecha,
            horaInicio,
            horaFin,
            link,
            direccion,
            tipo: tipoVal
          });

          if (typeof e.activo === 'boolean' && e.activo === false) {
            this.form.patchValue({ activarEvento: false });
          }

          // Si hay imagen, solo ponemos el nombre (no el binario)
          if (e.imagen) {
            this.form.patchValue({ imagen: { name: e.imagen } });
          }

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Error al cargar el evento',
              subtitle: 'No se pudo obtener la información del evento. Intenta de nuevo más tarde.',
              type: 'error'
            }
          });
        }
      });
    }
  }

  crear() {
    if (!this.form.valid) return;

    this.loading = true;
    this.error = null;
    const f = this.form.value;

    let fechaEvento: string | null = null;
    try {
      const fechaVal = f.fecha;
      const horaVal = f.horaInicio || '00:00';

      if (!fechaVal) {
        fechaEvento = null;
      } else if (typeof fechaVal === 'string' && fechaVal.includes('T')) {
        fechaEvento = fechaVal;
      } else {
        let datePart = '';
        if (fechaVal instanceof Date) {
          datePart = fechaVal.toISOString().slice(0, 10);
        } else {
          datePart = String(fechaVal);
        }

        let timePart = String(horaVal);
        if (/^\d{2}:\d{2}$/.test(timePart)) {
          timePart = `${timePart}:00`;
        }

        fechaEvento = `${datePart}T${timePart}`;
      }
    } catch {
      fechaEvento = null;
    }

    const tipoEvento = (f.tipo || 'PRESENCIAL').toString().toLowerCase();

    // Obtener token
    let token = this.form.value.token;
    if (!token) {
      token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken') ||
        '';
    }

    // Construir FormData si hay imagen binaria, sino JSON
    let isFormData = false;
    let bodyToSend: any;

    const imagenData = this.form.get('imagen')?.value;
    if (imagenData && imagenData.binary) {
      // Enviar como FormData con binario
      isFormData = true;
      const formData = new FormData();
      formData.append('titulo', f.nombre);
      formData.append('descripcion', f.descripcion || '');
      formData.append('fechaEvento', fechaEvento || '');
      formData.append('lugar', f.direccion || 'Online');
      formData.append('tipoEvento', tipoEvento);
      formData.append('activo', 'true');
      formData.append('linkInscripcion', f.link || '');
      
      // Agregar imagen binaria como Blob
      const blob = new Blob([imagenData.binary], { type: imagenData.type });
      formData.append('imagen', blob, imagenData.name);
      
      bodyToSend = formData;
    } else {
      // Enviar como JSON (sin imagen)
      bodyToSend = {
        titulo: f.nombre,
        descripcion: f.descripcion || '',
        fechaEvento: fechaEvento,
        lugar: f.direccion || 'Online',
        tipoEvento: tipoEvento,
        activo: true,
        linkInscripcion: f.link || '',
        imagen: imagenData?.name || null
      };
    }

    if (this.dialogData && this.dialogData.mode === 'edit') {
      const idEvento = this.dialogData.event?.id || this.dialogData.event?.idEvento;
      const idEmprendimiento = this.dialogData.event?.idEmprendimiento || 4;

      this.eventoService
        .editEvent(idEvento, bodyToSend, { token: token || undefined, isFormData: isFormData })
        .subscribe({
          next: (res: any) => {
            this.loading = false;
            const resId = res?.idEvento
              ? String(res.idEvento)
              : res?.id
              ? String(res.id)
              : String(idEvento);
            const closeObj = { ...res, id: resId };

            const activar = this.form.value.activarEvento === true;
            if (
              activar &&
              this.dialogData.event &&
              (this.dialogData.event.activo === false ||
                this.dialogData.event.activo === 0)
            ) {
              this.eventoService
                .activateEvent(idEvento, { token: token || undefined })
                .subscribe({
                  next: () => this.dialogRef.close({ ...closeObj, activo: true }),
                  error: () => this.dialogRef.close(closeObj)
                });
              return;
            }
            this.dialogRef.close(closeObj);
          },
          error: (err: any) => {
            this.loading = false;
            const message =
              err?.error?.message ||
              err?.message ||
              'Error actualizando evento';

            this.dialog.open(MensajeConfirmacionComponent, {
              width: '420px',
              data: {
                subject: 'Evento',
                title: 'Error al actualizar el evento',
                subtitle: message,
                type: 'error'
              }
            });
          }
        });
      return;
    }

    this.eventoService
      .createEvent(bodyToSend, {
        idEmprendimiento: 4,
        token: token || undefined,
        isFormData: isFormData
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err: any) => {
          this.loading = false;
          const message =
            err?.error?.message ||
            err?.message ||
            'Error creando evento';

          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Evento',
              title: 'Error al crear el evento',
              subtitle: message,
              type: 'error'
            }
          });
        }
      });
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    // Convertir a binario usando FileReader
    const reader = new FileReader();
    reader.onload = () => {
      // El resultado es un ArrayBuffer; lo convertimos a Uint8Array
      const arrayBuffer = reader.result as ArrayBuffer;
      const binaryData = new Uint8Array(arrayBuffer);
      this.form.patchValue({ 
        imagen: { 
          file: file,
          binary: binaryData,
          name: file.name,
          type: file.type
        } 
      });
      this.cdr.detectChanges();
    };
    reader.readAsArrayBuffer(file);
  }
}
