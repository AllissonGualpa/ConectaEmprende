import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../auth/auth.service';
import { EditarPerfilComponent, EditarPerfilData } from '../editar-perfil/editar-perfil.component';
import { MatDialog } from '@angular/material/dialog';
import { MensajeConfirmacionComponent } from '../../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

interface InformacionPersonal {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  direccion: string;
  avatarUrl?: string;
  genero?: string;
}

@Component({
  selector: 'app-seccion-personal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    EditarPerfilComponent,
  ],
  providers: [AuthService],
  templateUrl: './seccion-personal.component.html',
  styles: []
})
export class SeccionPersonalComponent implements OnInit {
  informacionPersonal: InformacionPersonal = {
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    fechaRegistro: '',
    direccion: ''
  };

  showEditarPerfil = false;
  formData: EditarPerfilData = {
    nombre: '',
    apellido: '',
    genero: '',
    correo: '',
    fechaNacimiento: '',
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const perfil = this.authService.getPerfilLocal();

    if (perfil) {
      this.informacionPersonal = {
        nombre: `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`.trim(),
        email: perfil.correo ?? perfil.correoUees ?? '',
        telefono: perfil.telefono ?? '',
        fechaNacimiento: this.formatDateWithoutTime(perfil.fechaNacimiento),
        fechaRegistro: this.formatDateWithoutTime(perfil.fechaRegistro),
        direccion: perfil.direccion ?? '',
        avatarUrl: perfil.avatarUrl ?? undefined,
        genero: perfil.genero ?? '',
      };
    } else {
      this.informacionPersonal = {
        nombre: 'Usuario',
        email: '',
        telefono: '',
        fechaNacimiento: '',
        fechaRegistro: '',
        direccion: ''
      };
    }
  }

  private formatDateWithoutTime(dateValue: string | Date | null | undefined): string {
    if (!dateValue) return '';

    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  editarPerfil(): void {
    const perfil = this.authService.getPerfilLocal() || {};
    this.formData = {
      nombre: perfil.nombre ?? '',
      apellido: perfil.apellido ?? '',
      genero: perfil.genero ?? '',
      correo: this.informacionPersonal.email,
      // Guardamos fechaNacimiento como ISO, si viene con hora ya debería estarlo
      fechaNacimiento: perfil.fechaNacimiento ?? '',
    };
    this.showEditarPerfil = true;
  }

  onGuardarPerfil(data: EditarPerfilData): void {
    const nombreCompleto = `${data.nombre} ${data.apellido}`.trim();

    this.informacionPersonal = {
      ...this.informacionPersonal,
      nombre: nombreCompleto,
      email: data.correo,
      fechaNacimiento: this.formatDateWithoutTime(data.fechaNacimiento),
      genero: data.genero,
    };

    this.loading = true;
    this.authService.editarPerfil({
      nombre: data.nombre,
      apellido: data.apellido,
      genero: data.genero,
      correo: data.correo,
      fechaNacimiento: data.fechaNacimiento,
    }).then((observable) => {
      observable.subscribe({
        next: () => {
          this.loading = false;
          this.showEditarPerfil = false;
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Perfil',
              title: 'Perfil actualizado',
              subtitle: 'Tus datos personales han sido actualizados correctamente.',
              type: 'success'
            }
          });
        },
        error: () => {
          this.loading = false;
          this.showEditarPerfil = false;
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Perfil',
              title: 'Error al actualizar',
              subtitle: 'No se pudo actualizar tu perfil. Por favor, inténtalo nuevamente.',
              type: 'error'
            }
          });
        }
      });
    });
  }

  onCancelarEdicion(): void {
    this.showEditarPerfil = false;
  }
}