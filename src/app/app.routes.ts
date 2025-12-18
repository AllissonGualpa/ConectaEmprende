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
import { AdminEmprendimientosComponent } from './modules/admin/admin-emprendimientos/admin-emprendimientos.component';
import { GestionEmprendedor } from './modules/emprendedor/gestion-emprendedor/gestion-emprendedor.component';
import { RoadmapComponent } from './modules/landing/roadmap/roadmap.component';
import { AdminAutoevaluacionComponent } from './modules/admin/admin-autoevaluacion/admin-autoevaluacion.component';
import { RoleGuard } from './core/services/role.guard';
import { AuthGuard } from './core/services/auth.guard';
import { AccesoDenegadoComponent } from './shared/components/acceso-denegado/acceso-denegado.component';
import { AdminSolicitudesComponent } from './modules/admin/admin-solicitudes/admin-solicitudes.component';
import { EmprendimientoDetailComponent } from './modules/landing/emprendimiento-detail/emprendimiento-detail.component';
import { EvaluacionComponent } from './modules/landing/evaluacion/evaluacion.component';
import { AdminEventoComponent } from './modules/admin/eventoAdmin/admin-evento/admin-evento.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },

  // Autenticación
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },

  // Landing pública
  { path: 'inicio', component: InicioComponent },
  { path: 'emprendimientos', component: EmprendimientosComponent },
  { path: 'emprendimientos/:id', component: EmprendimientoDetailComponent },
  { path: 'startups', component: StartupsComponent },
  { path: 'startups/:id', component: EmprendimientoDetailComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:id', component: BlogDetailComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'eventos/:id', component: EventoDetailComponent },
  { path: 'evaluacion', component: EvaluacionComponent },
  { path: 'evaluacion/:id', component: EvaluacionComponent },
  {path: 'roadmap', component: RoadmapComponent},

  // Emprendedor
  { path: 'emprendedor/gestion', component: GestionEmprendedor, canActivate: [RoleGuard], data: { roles: ['EMPRENDEDOR'] } },
  { path: 'emprendedor/roadmap/:id', component: RoadmapComponent, canActivate: [RoleGuard], data: { roles: ['EMPRENDEDOR'] } },

  // Administración
  { path: 'admin', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/evento', component: AdminEventoComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/blog', component: AdminBlogComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/blog/create', component: BlogCreateComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/blog/edit/:id', component: BlogCreateComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/emprendimientos', component: AdminEmprendimientosComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/solicitudes', component: AdminSolicitudesComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } },
  { path: 'admin/autoevaluacion', component: AdminAutoevaluacionComponent, canActivate: [RoleGuard], data: { roles: ['ADMINISTRADOR'] } }
];