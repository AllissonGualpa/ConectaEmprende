import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { InicioComponent } from './modules/landing/inicio/inicio.component';
import { EmprendimientosComponent } from './modules/landing/emprendimientos/emprendimientos.component';
import { StartupsComponent } from './modules/landing/startups/startups.component';
import { BlogComponent } from './modules/landing/blog/blog.component';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard/admin-dashboard.component';
import { EventosComponent } from './modules/landing/eventos/eventos.component';
import { AdminBlogComponent } from './modules/admin/admin-blog/admin-blog.component';
import { BlogCreateComponent } from './modules/admin/blog-create/blog-create.component';
import { BlogDetailComponent } from './modules/landing/blog-detail/blog-detail.component';


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
  { path: 'blog/:id', component: BlogDetailComponent }
  
];