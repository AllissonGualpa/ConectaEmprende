import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { InicioComponent } from './shared/pages/inicio/inicio.component';
import { EmprendimientosComponent } from './shared/pages/emprendimientos/emprendimientos.component';
import { StartupsComponent } from './shared/pages/startups/startups.component';
import { BlogComponent } from './shared/pages/blog/blog.component';
import { AdminDashboardComponent } from './modules/admin/pages/admin-dashboard/admin-dashboard.component';
import { EventosComponent } from './shared/pages/eventos/eventos.component';
import { AdminBlogComponent } from './modules/admin/pages/admin-blog/admin-blog.component';
import { BlogCreateComponent } from './modules/admin/pages/blog-create/blog-create.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'emprendimientos', component: EmprendimientosComponent },
  { path: 'startups', component: StartupsComponent},
  { path: 'blog', component: BlogComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'admin/blog', component: AdminBlogComponent },
  { path: 'admin/blog/create', component: BlogCreateComponent },
  
];