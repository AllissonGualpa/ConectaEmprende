import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

// Interfaz usada en register.component.ts
export interface RegisterData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  genero: string;
  contrasena: string;
  correo: string;
  correoUees: string;
  identificacion: string;
  parienteDirecto: boolean;
  idRol: number;
  nombrePariente?: string;
  areaPariente?: string;
  carrera?: string;
  fechaGraduacion?: string;
  anioEstudio?: string;
  semestre?: string;
  emprendimiento: {
    correoComercial: string;
    correoUees: string;
    identificacion: string;
    parienteDirecto: string;
    nombreComercialEmprendimiento: string;
    fechaCreacion: string;
    ciudad: number;
    provinia: number;
    estadoEmpredimiento: boolean;
    tipoEmprendimiento: string;
    tipoEmprendimientoId: number;
    datosPublicos: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://eureka-emprende.onrender.com/v1/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    // Inicializar el estado de autenticación solo en el navegador
    if (this.isBrowser()) {
      this.isAuthenticatedSubject.next(this.hasToken());
    }
  }

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Verificar si existe token al inicializar
  private hasToken(): boolean {
    if (this.isBrowser()) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  // Registro
  register(data: RegisterData): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/register`, data, { headers });
  }

  // Login
  login(email: string, password: string): Observable<any> {
    const body = JSON.stringify({ email, password });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(`${this.apiUrl}/login`, body, { headers }).pipe(
      tap((response: any) => {
        if (response.jwtToken && this.isBrowser()) {
          localStorage.setItem('token', response.jwtToken);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  // Logout
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
    }
    this.isAuthenticatedSubject.next(false);
  }

  // Obtener estado de autenticación
  getIsAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Obtener token
  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }
}