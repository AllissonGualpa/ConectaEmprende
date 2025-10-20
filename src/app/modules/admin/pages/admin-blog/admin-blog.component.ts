import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarAdminComponent } from '../../../../shared/components/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-admin-blog',
  standalone: true,
  imports: [CommonModule, NavbarAdminComponent],
  templateUrl: './admin-blog.component.html',
  styleUrls: ['./admin-blog.component.css']
})
export class AdminBlogComponent implements OnInit {
  blogs: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs() { }

  onSearch(event: any) { this.searchTerm = event.target.value.toLowerCase(); }

  get filteredBlogs() {
    if (!this.searchTerm) return this.blogs;
    return this.blogs.filter(blog =>
      blog.nombre.toLowerCase().includes(this.searchTerm) ||
      blog.categoria.toLowerCase().includes(this.searchTerm) ||
      blog.tipo.toLowerCase().includes(this.searchTerm)
    );
  }

  crearBlog() { 
    console.log('Navegando a crear blog...');
    this.router.navigate(['/admin/blog/create']);
  }
  
  editarBlog(blog: any) { console.log('Editar blog:', blog); }
  eliminarBlog(blog: any) { console.log('Eliminar blog:', blog); }
}