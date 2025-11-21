import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { BlogService } from '../blog.service';
import { Tag, AdminBlog } from '../blog.types';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarAdminComponent, HttpClientModule],
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.css']
})
export class BlogCreateComponent implements OnInit {
  @ViewChild('editor') editor!: ElementRef<HTMLTextAreaElement>;

  blog = {
    titulo: '',
    resumen: '',
    contenido: '',
    tags: [] as Tag[],
    imagenDestacada: null as File | null
  };

  tagSeleccionado = '';
  tags: Tag[] = [];
  seleccion = { start: 0, end: 0, texto: '' };

  // Nuevas propiedades para crear tags
  mostrarFormularioTag = false;
  nuevoTagNombre = '';

  // Estado de carga
  publicando = false;

  constructor(
    private router: Router,
    private blogService: BlogService
  ) { }

  ngOnInit() {
    this.cargarTags();
  }

  // Método para obtener headers con el token JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  cargarTags() {
    this.blogService.getAllTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        console.log('Tags cargados exitosamente:', tags);
      },
      error: (error) => {
        console.error('Error al cargar los tags:', error);
        alert('Error al cargar los tags. Por favor, intenta nuevamente.');
      }
    });
  }


  // Método para crear un nuevo tag
  crearNuevoTag() {
    if (!this.nuevoTagNombre.trim()) {
      alert('Por favor, ingresa un nombre para el tag');
      return;
    }

    this.blogService.createTag(this.nuevoTagNombre).subscribe({
      next: (response) => {
        console.log('Tag creado exitosamente:', response);
        alert('Tag creado exitosamente');

        // Recargar los tags
        this.cargarTags();

        // Limpiar y cerrar el formulario
        this.nuevoTagNombre = '';
        this.mostrarFormularioTag = false;
      },
      error: (error) => {
        console.error('Error al crear el tag:', error);

        if (error.status === 401 || error.status === 403) {
          alert('No tienes permisos para realizar esta acción.');
          this.router.navigate(['/login']);
        } else {
          alert(error.error?.message || 'Error al crear el tag.');
        }
      }
    });
  }

  // Método para mostrar/ocultar el formulario de crear tag
  toggleFormularioTag() {
    this.mostrarFormularioTag = !this.mostrarFormularioTag;
    if (!this.mostrarFormularioTag) {
      this.nuevoTagNombre = '';
    }
  }

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
    // Agregar lógica adicional aquí
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
    const tag = this.tags.find(t => t.nombre === this.tagSeleccionado);
    if (tag && !this.blog.tags.some(t => t.idTag === tag.idTag)) {
      this.blog.tags.push(tag);
    }
    this.tagSeleccionado = '';
  }

  removerTag(tag: Tag) {
    this.blog.tags = this.blog.tags.filter(t => t.idTag !== tag.idTag);
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

  /**
   * Método para subir la imagen al servidor
   */
  private subirImagen(file: File) {
    return this.blogService.uploadImage(file);
  }

  publicarBlog() {
    if (!this.validarBlog()) return;
    if (this.publicando) return;

    this.publicando = true;

    this.blogService.createBlog(this.blog).subscribe({
      next: (response) => {
        console.log('Artículo creado exitosamente:', response);
        this.publicando = false;
        alert('El artículo fue creado exitosamente');
        this.router.navigate(['/admin/blog']);
      },
      error: (error) => {
        console.error('Error al crear el artículo:', error);
        this.publicando = false;
        alert('Error al crear el artículo. Ver consola para más detalles.');
      }
    });
  }

  private validarBlog(): boolean {
    if (!this.blog.titulo.trim()) {
      alert('El título es obligatorio');
      return false;
    }
    if (!this.blog.contenido.trim()) {
      alert('El contenido es obligatorio');
      return false;
    }
    if (!this.blog.imagenDestacada) {
      alert('La imagen destacada es obligatoria');
      return false;
    }
    return true;
  }

  cancelar() {
    if (confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/blog']);
    }
  }

  editarBlog() {
    console.log('Modo edición activado');
    alert('Función de editar en construcción...');
  }

  archivarBlog() {
    if (confirm('¿Seguro que quieres archivar este artículo?')) {
      console.log('Artículo archivado');
      alert('Artículo archivado (simulado)');
    }
  }
}