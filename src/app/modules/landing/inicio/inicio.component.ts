import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, MatButtonModule, MatIconModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  isLoggedIn: boolean = false;

  // Cards dinámicos de categorías destacadas
  categoriasDestacadas = [
    {
      nombre: 'Arte y cultura',
      imagen: '/assets/img/inicio/foto1.jpg',
      anchura: 'normal' as 'normal' | 'wide',
      link: '#',
    },
    {
      nombre: 'Salud y Bienestar',
      imagen: '/assets/img/inicio/foto2.png',
      anchura: 'normal',
      link: '#',
    },
    {
      nombre: 'Tecnología y Software',
      imagen: '/assets/img/inicio/foto3.jpg',
      anchura: 'normal',
      link: '#',
    },
    {
      nombre: 'Moda y Accesorios',
      imagen: '/assets/img/inicio/foto4.jpg',
      anchura: 'normal',
      link: '#',
    },
    {
      nombre: 'Alimentos y Bebidas',
      imagen: '/assets/img/inicio/foto5.png',
      anchura: 'normal',
      link: '#',
    },
    {
      nombre: 'Medio Ambiente',
      imagen: '/assets/img/inicio/foto6.jpg',
      anchura: 'normal',
      link: '#',
    },
    {
      nombre: 'Educación y Formación',
      imagen: '/assets/img/inicio/foto7.png',
      anchura: 'wide',
      link: '#',
    },
    {
      nombre: 'Servicios Profesionales',
      imagen: '/assets/img/inicio/foto8.png',
      anchura: 'normal',
      link: '#',
    },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Ajusta esta lógica según tu mecanismo de auth real
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token;
    // Suscribirse al estado de autenticación
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }
}
