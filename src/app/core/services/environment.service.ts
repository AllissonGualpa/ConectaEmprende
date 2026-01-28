import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  getBaseUrl(): string {
    if (typeof window === 'undefined') {
      return 'https://conectaemprendessr.onrender.com/';
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `https://conectaemprendessr.onrender.com/`;
    } else {
      // URL de producción en Render
      return `https://conectaemprendessr.onrender.com/`;
    }
  }
}
