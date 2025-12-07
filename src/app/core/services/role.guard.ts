import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Obtén los roles permitidos de la ruta
    const allowedRoles = route.data['roles'] as string[];

    // Si no hay roles especificados, permitir el acceso
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Obtener el perfil local del usuario
    const perfil = this.authService.getPerfilLocal();

    if (!perfil) {
      console.warn('No se encontró perfil del usuario. Redirigiendo a login.');
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener el rol del perfil (ajusta según la estructura de tu perfil)
    const userRole = perfil.nombreRol || perfil.idRol || '';

    // Verificar si el rol del usuario está en los roles permitidos
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Si el usuario no tiene permiso, redirigir a una página de acceso denegado
    console.warn(`Acceso denegado. Tu rol (${userRole}) no tiene permisos para acceder a esta página.`);
    this.router.navigate(['/acceso-denegado']);
    return false;
  }
}
