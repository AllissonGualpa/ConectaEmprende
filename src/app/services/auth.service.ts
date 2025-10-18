import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}