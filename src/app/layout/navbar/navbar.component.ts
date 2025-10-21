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
  private authSubscription!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
      }
    );
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