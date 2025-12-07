import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router } from '@angular/router';
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
  avatarInitial: string = 'A';
  avatarMenuOpen = false;
  private authSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

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
    const nombre = perfil?.nombre || perfil?.nombres || perfil?.name || perfil?.usuario || '';
    const initial = nombre?.trim()?.charAt(0)?.toUpperCase();
    this.avatarInitial = initial || 'P';
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

  toggleAvatarMenu(): void {
    this.avatarMenuOpen = !this.avatarMenuOpen;
  }

  closeAvatarMenu(): void {
    this.avatarMenuOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMobile();
    this.closeAvatarMenu();
    this.router.navigate(['/inicio']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}