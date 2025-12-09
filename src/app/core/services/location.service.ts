import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment';

// DTOs básicos según la respuesta de la API
export interface ProvinciaDto {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface CiudadDto {
  id: number;
  nombreCiudad: string;
  provincia: ProvinciaDto;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  // Ajusta esta baseUrl según tu configuración real (environment, etc.)
  private readonly baseUrl = Environment.api_url;
  private readonly apiProvincia = this.baseUrl + Environment.api_provincia;
  private readonly apiCiudad = this.baseUrl + Environment.api_ciudades;

  constructor(private http: HttpClient) {}

  getProvincias(): Observable<ProvinciaDto[]> {
    return this.http.get<ProvinciaDto[]>(this.apiProvincia);
  }

  getCiudadesPorProvincia(idProvincia: number): Observable<CiudadDto[]> {
    return this.http.get<CiudadDto[]>(this.apiCiudad + `/provincia/${idProvincia}`);
  }
}
