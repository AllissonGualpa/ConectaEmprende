import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  getBaseUrl(): string {
    if (typeof window === 'undefined') {
      return 'http://localhost:4000';
    }

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    } else {
      // URL de producción en Render
      return `${protocol}//${hostname}`;
    }
  }
}
