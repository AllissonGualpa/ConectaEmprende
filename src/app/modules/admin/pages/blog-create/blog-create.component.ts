import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarAdminComponent } from '../../../../shared/components/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarAdminComponent],
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.css']
})
export class BlogCreateComponent {
  @ViewChild('editor') editor!: ElementRef<HTMLTextAreaElement>;

  blog = {
    titulo: '',
    resumen: '',
    contenido: '',
    tags: [] as string[],
    imagenDestacada: null as File | null
  };

  tagSeleccionado = '';
  seleccion = { start: 0, end: 0, texto: '' };

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.setupEditor();
  }

  setupEditor() {
    const textarea = this.editor.nativeElement;
    textarea.addEventListener('select', this.actualizarSeleccion.bind(this));
    textarea.addEventListener('click', this.actualizarSeleccion.bind(this));
    textarea.addEventListener('keyup', this.actualizarSeleccion.bind(this));
  }

  actualizarSeleccion() {
    const textarea = this.editor.nativeElement;
    this.seleccion.start = textarea.selectionStart;
    this.seleccion.end = textarea.selectionEnd;
    this.seleccion.texto = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
  }

  onContentChange() {

  }

  aplicarFormato(tipo: string) {
    const textarea = this.editor.nativeElement;
    const inicio = textarea.selectionStart;
    const fin = textarea.selectionEnd;
    const textoSeleccionado = this.seleccion.texto;
    let textoFormateado = '';

    switch (tipo) {
      case 'bold':
        textoFormateado = `**${textoSeleccionado}**`;
        break;
      case 'italic':
        textoFormateado = `*${textoSeleccionado}*`;
        break;
      case 'list':
        textoFormateado = textoSeleccionado.split('\n').map(line => `• ${line}`).join('\n');
        break;
      default:
        textoFormateado = textoSeleccionado;
    }

    const contenido = textarea.value;
    const nuevoContenido = contenido.substring(0, inicio) + textoFormateado + contenido.substring(fin);
    
    this.blog.contenido = nuevoContenido;
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(inicio, inicio + textoFormateado.length);
    }, 0);
  }

  insertarImagen() {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      this.insertarTexto(`![Descripción de la imagen](${url})`);
    }
  }

  insertarEnlace() {
    const url = prompt('Ingresa la URL:');
    if (url) {
      const texto = this.seleccion.texto || 'Texto del enlace';
      this.insertarTexto(`[${texto}](${url})`);
    }
  }

  insertarTexto(texto: string) {
    const textarea = this.editor.nativeElement;
    const inicio = textarea.selectionStart;
    const fin = textarea.selectionEnd;
    const contenido = textarea.value;
    
    this.blog.contenido = contenido.substring(0, inicio) + texto + contenido.substring(fin);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(inicio + texto.length, inicio + texto.length);
    }, 0);
  }

  agregarTag() {
    if (this.tagSeleccionado && !this.blog.tags.includes(this.tagSeleccionado)) {
      this.blog.tags.push(this.tagSeleccionado);
      this.tagSeleccionado = '';
    }
  }

  removerTag(tag: string) {
    this.blog.tags = this.blog.tags.filter(t => t !== tag);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no puede ser mayor a 5MB');
        return;
      }
      this.blog.imagenDestacada = file;
    }
  }

  removerImagen() {
    this.blog.imagenDestacada = null;
  }

  publicarBlog() {
    if (!this.blog.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (!this.blog.contenido.trim()) {
      alert('El contenido es obligatorio');
      return;
    }

    console.log('Publicando blog:', this.blog);
    alert('Blog publicado exitosamente');
    this.router.navigate(['/admin/blog']);
  }

  cancelar() {
    if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/blog']);
    }
  }
}