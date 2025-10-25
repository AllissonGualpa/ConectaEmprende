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
    this.http.get<any>(`${this.apiUrl}/articulos/${id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.blog = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el blog:', err);
        alert('Error al cargar el blog');
      }
    });
  }


  cargarTags() {
    this.http.get<Tag[]>(`${this.apiUrl}/tags`, { headers: this.getAuthHeaders() }).subscribe({
      next: (tags) => this.tags = tags,
      error: (err) => console.error('Error al cargar tags:', err)
    });
  }

  toggleFormularioTag() { this.mostrarFormularioTag = !this.mostrarFormularioTag; this.nuevoTagNombre = ''; }

  crearNuevoTag() {
    if (!this.nuevoTagNombre.trim()) return;

    const idUsuario = localStorage.getItem('idUsuario') || '1';
    this.http.post(`${this.apiUrl}/tags/crear?idUsuario=${idUsuario}`, { nombre: this.nuevoTagNombre }, { headers: this.getAuthHeaders() })
      .subscribe({ next: () => this.cargarTags(), error: (err) => console.error(err) });
  }

  agregarTag() {
    const tag = this.tags.find(t => t.nombre === this.tagSeleccionado);
    if (tag && !this.blog.tags.some((t: Tag) => t.idTag === tag.idTag)) this.blog.tags.push(tag);
    this.tagSeleccionado = '';
  }

  removerTag(tag: Tag) { this.blog.tags = this.blog.tags.filter((t: Tag) => t.idTag !== tag.idTag); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) this.blog.imagenDestacada = file;
  }

  removerImagen() { this.blog.imagenDestacada = null; this.blog.urlImagen = null; }

  aplicarFormato(tipo: string) {
    const textarea = this.editor.nativeElement;
    const start = textarea.selectionStart, end = textarea.selectionEnd;
    let text = textarea.value.substring(start, end);
    if (tipo === 'bold') text = `**${text}**`;
    else if (tipo === 'italic') text = `*${text}*`;
    else if (tipo === 'list') text = text.split('\n').map(l => `• ${l}`).join('\n');
    this.blog.contenido = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start, start + text.length); }, 0);
  }

  insertarImagen() { const url = prompt('Ingresa URL de la imagen'); if (url) this.blog.contenido += `![Imagen](${url})`; }
  insertarEnlace() { const url = prompt('Ingresa URL'); if (url) this.blog.contenido += `[Enlace](${url})`; }

  actualizarBlog() {
    const blogId = this.blog.idArticulo;
    const idUsuario = this.blog.idUsuario || 1;

    const payload = {
      titulo: this.blog.titulo,
      descripcionCorta: this.blog.descripcionCorta,
      contenido: this.blog.contenido,
      estado: this.blog.estado,
      idImagen: this.blog.idImagen,
      idsTags: this.blog.tags.map((t: Tag) => t.idTag)
    };

    this.http.put(`${this.apiUrl}/articulos/${blogId}?idUsuario=${idUsuario}`, payload, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => { alert('Blog actualizado'); this.router.navigate(['/admin/blog']); },
        error: (err) => { console.error('Error al actualizar blog:', err); alert('Error al actualizar blog'); }
      });
  }

  cancelar() { this.router.navigate(['/admin/blog']); }

  onContentChange() { }
}
