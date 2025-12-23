import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  private apiUrl = environment.api_url + environment.api_auth;
  private apiUrlUsuarios = environment.api_url + environment.api_usuarios;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private perfilKey = 'perfil';

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

    // Verifica si el token JWT ha expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      // JWT: header.payload.signature
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return true;
      // exp está en segundos desde epoch
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (e) {
      return true;
    }
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

  getPerfil(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(this.apiUrlUsuarios + '/perfil', { headers }).pipe(
      tap(perfil => {
        try {
          localStorage.setItem(this.perfilKey, JSON.stringify(perfil));
        } catch (error) {
          console.error('Error storing perfil in localStorage:', error);
        }
      })
    );
  }

  getPerfilLocal(): any | null {
    if (!this.isBrowser()) return null;

    const raw = localStorage.getItem(this.perfilKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // Logout
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem(this.perfilKey);
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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  async editarPerfil(payload: {
    nombre: string;
    apellido: string;
    genero: string;
    correo: string;
    fechaNacimiento: string;
  }): Promise<Observable<any>> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    // Obtener el id del perfil guardado en localStorage
    await this.getPerfil();
    const perfil = this.getPerfilLocal();
    const id = perfil?.id;
    if (!id) {
      throw new Error('No se encontró el id del usuario en el perfil local');
    }
    return this.http.put<any>(
      this.apiUrlUsuarios + '/' + id,
      payload,
      { headers }
    ).pipe(
      tap(() => {
        // Al actualizar correctamente, obtener el perfil actualizado y guardarlo en localStorage
        this.getPerfil().subscribe();
      })
    );
  }

}