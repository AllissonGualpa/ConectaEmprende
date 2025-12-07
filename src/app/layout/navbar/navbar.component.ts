import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../modules/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileOpen = signal(false);
  isAuthenticated = false;
  userRole: string = '';
  private authSubscription!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        // Obtener el rol cuando hay cambios de autenticación
        if (isAuth) {
          this.getUserRole();
        } else {
          this.userRole = '';
        }
      }
    );
    // Obtener el rol inicial
    this.getUserRole();
  }

  getUserRole(): void {
    const perfil = this.authService.getPerfilLocal();
    this.userRole = perfil?.nombreRol || perfil?.idRol || '';
  }

  isAdmin(): boolean {
    return this.userRole === 'ADMINISTRADOR';
  }

  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobile();
    // Opcional: redirigir al inicio después de logout
    // this.router.navigate(['/inicio']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}