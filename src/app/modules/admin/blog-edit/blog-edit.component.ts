import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';

interface Tag {
  idTag: number;
  nombre: string;
}

@Component({
  selector: 'app-blog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarAdminComponent],
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.css']
})
export class BlogEditComponent implements OnInit {
  @ViewChild('editor') editor!: ElementRef<HTMLTextAreaElement>;

  blog: any = {};
  tags: Tag[] = [];
  tagSeleccionado = '';
  mostrarFormularioTag = false;
  nuevoTagNombre = '';
  loading = true;

  private apiUrl = 'https://eureka-emprende.onrender.com/v1/blog';
  private adminApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/admin';
  private publicApiUrl = 'https://eureka-emprende.onrender.com/v1/blog/publico';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) { }

  ngOnInit() {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (!blogId) return;

    this.cargarTags();
    this.loadBlog(blogId);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadBlog(id: string) {
    // Usar el endpoint de admin para obtener el artículo
    this.http.get<any>(`${this.adminApiUrl}/articulos/${id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.blog = data;
        // Asegurar que tags sea un array
        if (!this.blog.tags) {
          this.blog.tags = [];
        }
        console.log('Blog cargado:', this.blog);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el blog:', err);
        alert('Error al cargar el blog');
        this.loading = false;
      }
    });
  }

  cargarTags() {
    // Usar el endpoint público para obtener tags (requiere autenticación)
    this.http.get<Tag[]>(`${this.publicApiUrl}/tags`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (tags) => {
        this.tags = tags;
        console.log('Tags cargados:', tags);
      },
      error: (err) => {
        console.error('Error al cargar tags:', err);
        alert('Error al cargar los tags disponibles');
      }
    });
  }

  toggleFormularioTag() {
    this.mostrarFormularioTag = !this.mostrarFormularioTag;
    this.nuevoTagNombre = '';
  }

  crearNuevoTag() {
    if (!this.nuevoTagNombre.trim()) {
      alert('Por favor ingresa un nombre para el tag');
      return;
    }

    const idUsuario = localStorage.getItem('idUsuario') || '1';
    this.http.post(`${this.apiUrl}/tags/crear?idUsuario=${idUsuario}`,
      { nombre: this.nuevoTagNombre },
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        alert('Tag creado exitosamente');
        this.cargarTags();
        this.mostrarFormularioTag = false;
        this.nuevoTagNombre = '';
      },
      error: (err) => {
        console.error('Error al crear tag:', err);
        alert('Error al crear el tag');
      }
    });
  }

  agregarTag() {
    if (!this.tagSeleccionado) {
      alert('Por favor selecciona un tag');
      return;
    }

    const tag = this.tags.find(t => t.nombre === this.tagSeleccionado);
    if (tag && !this.blog.tags.some((t: Tag) => t.idTag === tag.idTag)) {
      this.blog.tags.push(tag);
    }
    this.tagSeleccionado = '';
  }

  removerTag(tag: Tag) {
    this.blog.tags = this.blog.tags.filter((t: Tag) => t.idTag !== tag.idTag);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      this.blog.imagenDestacada = file;
    }
  }

  removerImagen() {
    this.blog.imagenDestacada = null;
    this.blog.urlImagen = null;
  }

  aplicarFormato(tipo: string) {
    const textarea = this.editor.nativeElement;
    const start = textarea.selectionStart, end = textarea.selectionEnd;
    let text = textarea.value.substring(start, end);

    if (tipo === 'bold') text = `**${text}**`;
    else if (tipo === 'italic') text = `*${text}*`;
    else if (tipo === 'list') text = text.split('\n').map(l => `• ${l}`).join('\n');

    this.blog.contenido = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + text.length);
    }, 0);
  }

  insertarImagen() {
    const url = prompt('Ingresa URL de la imagen');
    if (url) this.blog.contenido += `\n![Imagen](${url})\n`;
  }

  insertarEnlace() {
    const texto = prompt('Ingresa el texto del enlace') || 'Enlace';
    const url = prompt('Ingresa URL');
    if (url) this.blog.contenido += `[${texto}](${url})`;
  }

  actualizarBlog() {
    // Validaciones
    if (!this.blog.titulo || !this.blog.titulo.trim()) {
      alert('Por favor ingresa un título para el blog');
      return;
    }

    if (!this.blog.descripcionCorta || !this.blog.descripcionCorta.trim()) {
      alert('Por favor ingresa un resumen para el blog');
      return;
    }

    if (!this.blog.contenido || !this.blog.contenido.trim()) {
      alert('Por favor ingresa el contenido del blog');
      return;
    }

    if (!this.blog.tags || this.blog.tags.length === 0) {
      alert('Por favor agrega al menos un tag al blog');
      return;
    }

    if (!this.blog.idImagen) {
      alert('El blog debe tener una imagen destacada');
      return;
    }

    const blogId = this.blog.idArticulo;
    const idUsuario = this.blog.idUsuario || localStorage.getItem('idUsuario') || 1;

    const payload = {
      titulo: this.blog.titulo,
      descripcionCorta: this.blog.descripcionCorta,
      contenido: this.blog.contenido,
      estado: this.blog.estado,
      imagen: this.blog.idImagen,
      idsTags: this.blog.tags.map((t: Tag) => t.idTag)
    };

    this.http.put(`${this.apiUrl}/articulos/${blogId}?idUsuario=${idUsuario}`, payload, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        alert('Blog actualizado exitosamente');
        this.router.navigate(['/admin/blog']);
      },
      error: (err) => {
        console.error('Error al actualizar blog:', err);
        alert('Error al actualizar el blog. Por favor verifica los datos e intenta nuevamente.');
      }
    });
  }

  cancelar() {
    if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/blog']);
    }
  }

  onContentChange() { }
}