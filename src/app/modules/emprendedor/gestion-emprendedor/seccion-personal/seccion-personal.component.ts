import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../auth/auth.service';

interface InformacionPersonal {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  direccion: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-seccion-personal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
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

  constructor(private authService: AuthService) {}

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
        avatarUrl: perfil.avatarUrl ?? undefined
      };
    } else {
      // Valores por defecto si no hay perfil en localStorage
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

    // Formato dd/MM/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  editarPerfil(): void {
    // Aquí implementas la lógica para editar el perfil
    // Puede abrir un dialog de Material o navegar a otra vista
  }

  // cargarDatosUsuario(): void {
  //   this.usuarioService.obtenerPerfil().subscribe(datos => {
  //     this.informacionPersonal = datos;
  //   });
  // }
}