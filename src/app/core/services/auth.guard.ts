import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Obtener el perfil local del usuario
    const perfil = this.authService.getPerfilLocal();
    const token = this.authService.getToken();

    // Si el usuario está logueado (tiene token y perfil)
    if (token && perfil) {
      // Si intenta acceder a login o register, redirigir a inicio
      if (state.url === '/login' || state.url === '/register') {
        console.warn('Ya estás logueado. Redirigiendo a inicio.');
        this.router.navigate(['/inicio']);
        return false;
      }
      // Si está logueado, permitir acceso a otras rutas públicas
      return true;
    }

    // Si no está logueado
    // Si intenta acceder a rutas protegidas, redirigir a login
    if (
      state.url.includes('/admin') ||
      state.url.includes('/emprendedor')
    ) {
      console.warn('Debes iniciar sesión para acceder a esta página.');
      this.router.navigate(['/login']);
      return false;
    }

    // Permitir acceso a rutas públicas (login, register, inicio, etc.)
    return true;
  }
}
