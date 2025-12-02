import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { BlogService } from '../blog.service';
import { Tag } from '../blog.types';
// NUEVO: imports para dialog
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarAdminComponent,
    HttpClientModule,
    MatDialogModule // NUEVO
  ],
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.css']
})
export class BlogCreateComponent implements OnInit, AfterViewInit {
  quill!: any;
  isBrowser = false;

  // modo del formulario: 'create' o 'edit'
  mode: 'create' | 'edit' = 'create';
  blogId: number | null = null;

  blog = {
    titulo: '',
    resumen: '',
    contenido: '',
    tags: [] as Tag[],
    imagenDestacada: null as File | null,
    urlImagen: '' as string | null,
    estado: 'BORRADOR'
  };

  tagSeleccionado = '';
  tags: Tag[] = [];

  mostrarFormularioTag = false;
  nuevoTagNombre = '';

  publicando = false;
  loading = false;

  // Flag: indica si el contenido del blog ya fue cargado desde el backend
  private contentLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog // NUEVO
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.cargarTags();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.blogId = Number(id);
      this.cargarArticuloParaEditar(this.blogId);
    } else {
      this.mode = 'create';
    }
  }

  async ngAfterViewInit() {
    if (this.isBrowser) {
      await this.inicializarQuill();
    }
  }

  async inicializarQuill() {
    const Quill = (await import('quill')).default;
    const editorElement = document.getElementById('quillEditor');
    if (!editorElement) {
      console.error('No se encontró el contenedor #quillEditor');
      return;
    }

    this.quill = new Quill(editorElement, {
      theme: 'snow',
      placeholder: 'Escribe el contenido del blog aquí...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          [{ header: [1, 2, 3, false] }],
          ['clean']
        ]
      }
    });

    // Si ya se cargó contenido (modo edición), sincronizar ahora
    this.syncQuillContent();

    this.quill.on('text-change', () => {
      // Solo actualizar el modelo desde Quill (fuente de verdad = editor)
      this.blog.contenido = this.quill.root.innerHTML;
    });
  }

  /** Sincroniza el contenido del modelo con el editor, si ambos están listos */
  private syncQuillContent() {
    if (!this.quill) return;
    if (!this.contentLoaded && !this.blog.contenido) return;

    // Limpiar primero para evitar contenido residual desordenado
    this.quill.setText('');
    // Asignar el HTML del contenido ya cargado
    this.quill.root.innerHTML = this.blog.contenido || '';
  }

  private cargarArticuloParaEditar(id: number) {
    this.loading = true;
    this.blogService.getArticleById(id).subscribe({
      next: (data) => {
        this.blog.titulo = data.titulo;
        this.blog.resumen = data.descripcionCorta || data.resumen || '';
        this.blog.contenido = data.contenido || '';
        this.blog.tags = data.tags || [];
        this.blog.urlImagen = data.urlImagen || null;
        this.blog.estado = data.estado || 'BORRADOR';

        this.loading = false;

        this.syncQuillContent();
        this.contentLoaded = true;
      },
      error: (err) => {
        console.error('Error al cargar el artículo para editar:', err);
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'error',
            title: 'No se pudo cargar el blog',
            subtitle: 'Hubo un problema al obtener la información. Actualiza la página o inténtalo más tarde.'
          }
        });
        this.loading = false;
      }
    });
    this.loading = false;
  }

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
      },
      error: () => {
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'error',
            subject: 'Tags',
            subtitle: 'No se pudieron cargar los tags. Intenta de nuevo más tarde.'
          }
        });
      }
    });
  }

  crearNuevoTag() {
    if (!this.nuevoTagNombre.trim()) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'info',
          title: 'Nombre requerido',
          subtitle: 'Escribe un nombre para el nuevo tag antes de continuar.'
        }
      });
      return;
    }

    this.blogService.createTag(this.nuevoTagNombre).subscribe({
      next: () => {
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'success',
            subject: 'Tag',
            subtitle: 'El tag se creó correctamente y ya está disponible en la lista.'
          }
        });
        this.cargarTags();
        this.nuevoTagNombre = '';
        this.mostrarFormularioTag = false;
      },
      error: (error) => {
        if (error.status === 401 || error.status === 403) {
          this.dialog.open(MensajeConfirmacionComponent, {
            data: {
              type: 'error',
              title: 'Acceso denegado',
              subtitle: 'No tienes permisos para crear tags. Inicia sesión con una cuenta autorizada.'
            }
          }).afterClosed().subscribe(() => {
            this.router.navigate(['/login']);
          });
        } else {
          this.dialog.open(MensajeConfirmacionComponent, {
            data: {
              type: 'error',
              subject: 'Tag',
              subtitle: error.error?.message || 'Ocurrió un problema al crear el tag. Inténtalo nuevamente.'
            }
          });
        }
      }
    });
  }

  toggleFormularioTag() {
    this.mostrarFormularioTag = !this.mostrarFormularioTag;
    if (!this.mostrarFormularioTag) {
      this.nuevoTagNombre = '';
    }
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
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'info',
          title: 'Imagen demasiado pesada',
          subtitle: 'La imagen no puede superar los 5 MB. Selecciona un archivo más ligero.'
        }
      });
      return;
    }

    this.blog.imagenDestacada = file;
    // al seleccionar una nueva imagen, limpiamos la url previa (si venía del backend)
    this.blog.urlImagen = null;
  }

  removerImagen() {
    this.blog.imagenDestacada = null;
    this.blog.urlImagen = null;
  }

  guardar() {
    if (!this.validarBlog()) return;
    if (this.publicando) return;

    this.publicando = true;

    if (this.mode === 'create') {
      this.crearArticulo();
    } else {
      this.actualizarArticulo();
    }
  }

  private crearArticulo() {
    this.blogService.createBlog(this.blog).subscribe({
      next: () => {
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'success',
            subject: 'Blog',
            subtitle: 'El artículo se publicó correctamente.'
          }
        }).afterClosed().subscribe(() => {
          this.publicando = false;
          this.router.navigate(['/admin/blog']);
        });
      },
      error: () => {
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'error',
            subject: 'Blog',
            subtitle: 'No se pudo crear el artículo. Revisa la información e inténtalo nuevamente.'
          }
        });
        this.publicando = false;
      }
    });
  }

  private actualizarArticulo() {
    if (!this.blogId) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'error',
          title: 'Artículo no encontrado',
          subtitle: 'No pudimos identificar el artículo a editar. Vuelve al listado e inténtalo otra vez.'
        }
      });
      this.publicando = false;
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.blog.titulo);
    formData.append('descripcionCorta', this.blog.resumen);
    formData.append('contenido', this.blog.contenido);
    formData.append('estado', this.blog.estado);

    if (this.blog.imagenDestacada instanceof File) {
      formData.append('imagen', this.blog.imagenDestacada);
    }

    const idsTags = this.blog.tags.map((t: Tag) => t.idTag);
    idsTags.forEach((id: number) => {
      formData.append('idsTags', id.toString());
    });

    const idUsuario = localStorage.getItem('idUsuario') || 1;

    this.blogService.updateArticle(this.blogId, formData, Number(idUsuario)).subscribe({
      next: () => {
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'success',
            subject: 'Blog',
            subtitle: 'Los cambios se guardaron correctamente.'
          }
        }).afterClosed().subscribe(() => {
          this.publicando = false;
          this.router.navigate(['/admin/blog']);
        });
      },
      error: (err) => {
        console.error('Error al actualizar el artículo:', err);
        this.dialog.open(MensajeConfirmacionComponent, {
          data: {
            type: 'error',
            subject: 'Blog',
            subtitle: 'No se pudo actualizar el artículo. Verifica los datos e inténtalo de nuevo.'
          }
        });
        this.publicando = false;
      }
    });
  }

  private validarBlog(): boolean {
    if (!this.blog.titulo.trim()) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'info',
          title: 'Falta el título',
          subtitle: 'Escribe un título para el blog antes de continuar.'
        }
      });
      return false;
    }

    if (!this.blog.contenido.trim()) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'info',
          title: 'Contenido vacío',
          subtitle: 'Agrega el contenido del artículo para poder guardarlo.'
        }
      });
      return false;
    }

    if (this.mode === 'create' && !this.blog.imagenDestacada) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'info',
          title: 'Imagen requerida',
          subtitle: 'Selecciona una imagen destacada para el artículo.'
        }
      });
      return false;
    }

    return true;
  }

  cancelar() {
    if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/blog']);
    }
  }

  editarBlog() {
    // ya no es necesario: el propio componente soporta edición
  }

  archivarBlog() {
    if (confirm('¿Seguro que quieres archivar el artículo?')) {
      this.dialog.open(MensajeConfirmacionComponent, {
        data: {
          type: 'info',
          subject: 'Blog',
          subtitle: 'El artículo se marcó como archivado (acción simulada).'
        }
      });
    }
  }
}
