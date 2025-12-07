import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="acceso-denegado-container">
      <div class="contenido">
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Por favor, verifica tu rol o contacta al administrador.</p>
        <a routerLink="/inicio" class="btn-volver">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .acceso-denegado-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #ED6C1C 0%, #f97316 100%);
    }

    .contenido {
      text-align: center;
      background: #FFFDE5;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    h1 {
      color: #ED6C1C;
      margin-bottom: 20px;
    }

    p {
      color: #333;
      margin: 10px 0;
    }

    .btn-volver {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #ED6C1C;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s;
    }

    .btn-volver:hover {
      background-color: #d55e18;
    }
  `]
})
export class AccesoDenegadoComponent {}
