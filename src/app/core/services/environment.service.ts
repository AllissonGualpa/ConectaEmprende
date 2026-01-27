import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  getBaseUrl(): string {
    // Detectar si estamos en producción (Render) o desarrollo
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    } else {
      // URL de producción en Render
      return 'https://conectaemprende.onrender.com';
    }
  }
}
