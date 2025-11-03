import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { InicioComponent } from './modules/landing/inicio/inicio.component';
import { EmprendimientosComponent } from './modules/landing/emprendimientos/emprendimientos.component';
import { StartupsComponent } from './modules/landing/startups/startups.component';
import { StartupsDetailComponent } from './modules/landing/startups-detail/startups-detail.component';
import { BlogComponent } from './modules/landing/blog/blog.component';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { EventosComponent } from './modules/landing/eventos/eventos.component';
import { EventoDetailComponent } from './modules/landing/evento-detail/evento-detail.component';
import { AdminBlogComponent } from './modules/admin/admin-blog/admin-blog.component';
import { BlogCreateComponent } from './modules/admin/blog-create/blog-create.component';
import { BlogDetailComponent } from './modules/landing/blog-detail/blog-detail.component';
import { AdminEventoComponent } from './modules/admin/admin-evento/admin-evento.component';
import { BlogEditComponent } from './modules/admin/blog-edit/blog-edit.component';
import { AdminEmprendimientosComponent } from './modules/admin/admin-emprendimientos/admin-emprendimientos.component';
import { GestionEmprendedor } from './modules/emprendedor/gestion-emprendedor/gestion-emprendedor.component';
import { RoadmapComponent } from './modules/landing/roadmap/roadmap.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  // Autenticación
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Landing pública
  { path: 'inicio', component: InicioComponent },
  { path: 'emprendimientos', component: EmprendimientosComponent },
  { path: 'startups', component: StartupsComponent },
  { path: 'startups/:id', component: StartupsDetailComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:id', component: BlogDetailComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'eventos/:id', component: EventoDetailComponent },

  // Emprendedor
  { path: 'emprendedor/gestion', component: GestionEmprendedor },
  { path: 'emprendedor/roadmap', component: RoadmapComponent },

  // Administración
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/evento', component: AdminEventoComponent },
  { path: 'admin/blog', component: AdminBlogComponent },
  { path: 'admin/blog/create', component: BlogCreateComponent },
  { path: 'admin/blog/edit/:id', component: BlogEditComponent },
  { path: 'admin/emprendimientos', component: AdminEmprendimientosComponent }
];