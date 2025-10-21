import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

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
  templateUrl: './seccion-personal.component.html',
  styles: []
})
export class SeccionPersonalComponent implements OnInit {
  informacionPersonal: InformacionPersonal = {
    nombre: 'Joseline Vergara Correa',
    email: 'joselinevergara@uees.edu.ec',
    telefono: '0999853377',
    fechaNacimiento: '01/09/2004',
    fechaRegistro: '31/07/2025',
    direccion: 'Urbanización Las Pirámides'
  };

  ngOnInit(): void {
    // Aquí puedes cargar los datos del usuario desde un servicio
    // this.cargarDatosUsuario();
  }

  editarPerfil(): void {
    console.log('Editar perfil');
    // Aquí implementas la lógica para editar el perfil
    // Puede abrir un dialog de Material o navegar a otra vista
  }

  // cargarDatosUsuario(): void {
  //   this.usuarioService.obtenerPerfil().subscribe(datos => {
  //     this.informacionPersonal = datos;
  //   });
  // }
}