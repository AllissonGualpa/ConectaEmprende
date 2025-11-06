import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { BlogService } from '../blog.service';
import { Tag, AdminBlog } from '../blog.types';

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
  imagenOriginal: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private blogService: BlogService) {}

  ngOnInit() {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (!blogId) return;
    this.cargarTags();
    this.loadBlog(blogId);
  }

  loadBlog(id: string) {
    this.blogService.getArticleById(Number(id)).subscribe({
      next: (data) => {
        this.blog = data;
        if (!this.blog.tags) this.blog.tags = [];
        this.imagenOriginal = this.blog.urlImagen || null;
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
    this.blogService.getAllTags().subscribe({
      next: (tags) => this.tags = tags,
      error: (err) => {
        console.error('Error al cargar los tags:', err);
        alert('Error al cargar los tags.');
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
    this.blogService.createTag(this.nuevoTagNombre).subscribe({
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
    if (!this.blog.titulo?.trim() || !this.blog.descripcionCorta?.trim() || !this.blog.contenido?.trim()) {
      alert('Completa todos los campos obligatorios');
      return;
    }
    if (!this.blog.tags || this.blog.tags.length === 0) {
      alert('Por favor agrega al menos un tag al blog');
      return;
    }

    const blogId = this.blog.idArticulo;
    const idUsuario = this.blog.idUsuario || localStorage.getItem('idUsuario') || 1;
    const formData = new FormData();
    formData.append('titulo', this.blog.titulo);
    formData.append('descripcionCorta', this.blog.descripcionCorta);
    formData.append('contenido', this.blog.contenido);
    formData.append('estado', this.blog.estado);

    if (this.blog.imagenDestacada instanceof File) {
      formData.append('imagen', this.blog.imagenDestacada);
    }

    const idsTags = this.blog.tags.map((t: Tag) => t.idTag);
    idsTags.forEach((id: number) => {
      formData.append('idsTags', id.toString());
    });

    this.blogService.updateArticle(blogId, formData, Number(idUsuario)).subscribe({
      next: () => {
        alert('Blog actualizado exitosamente');
        this.router.navigate(['/admin/blog']);
      },
      error: (err) => {
        console.error('Error al actualizar blog:', err);
        alert('Error al actualizar el blog. Verifica los datos e intenta nuevamente.');
      }
    });
  }

  cancelar() {
    if (confirm('¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/blog']);
    }
  }

  onContentChange() {}
}
