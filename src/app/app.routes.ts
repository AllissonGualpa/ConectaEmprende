import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { InicioComponent } from './shared/pages/inicio/inicio.component';
import { EmprendimientosComponent } from './shared/pages/emprendimientos/emprendimientos.component';
import { StartupsComponent } from './shared/pages/startups/startups.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'emprendimientos', component: EmprendimientosComponent },
  { path: 'startups', component: StartupsComponent}
];