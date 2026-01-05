import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { AuthService } from '../../auth/auth.service';
import { 
  DashboardService, 
  EmprendimientoMenosVisto,
  EmprendimientoTop,
  CategoriaMasVista,
  PreguntaAutoevaluacion, 
  CategoriaConVistas,
  RankingGlobalDTO
} from '../dashboard.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarAdminComponent, FormsModule, HttpClientModule],
  providers: [DashboardService],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  user = {
    name: '',
    role: ''
  };

  stats = {
    totalUsers: 0,
    emprendimientos: 0,
    totalVisits: 0
  };

  // Datos de la API
  emprendimientosMenosVistos: EmprendimientoMenosVisto[] = [];
  topEmprendimientos: EmprendimientoTop[] = [];
  emprendimientosMejorValorados: EmprendimientoTop[] = [];
  emprendimientosPeorValorados: EmprendimientoTop[] = [];
  categoriaMasVista: CategoriaMasVista | null = null;
  preguntasAutoevaluacion: PreguntaAutoevaluacion[] = [];
  // Agregar después de categoriaMasVista
categoriasOrdenadas: CategoriaConVistas[] = [];
  // Lista de todos los emprendimientos para el filtro
  todosEmprendimientos: any[] = [];
  // Guardar todas las preguntas del formulario
  todasLasPreguntas: any[] = [];

  // Filtros para preguntas
  filtroEmprendimiento: number | null = null;
  filtroFecha: string = '';

  // Loading states
  isLoading = true;
  errorMessage = '';

  genero: string | null = null;

  get saludo(): string {
    const g = (this.genero || '').toLowerCase();
    if (g === 'femenino' || g === 'f' || g === 'mujer') {
      return 'Bienvenida';
    }
    return 'Bienvenido';
  }

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    const perfil = this.authService.getPerfilLocal();

    this.user = {
      name: perfil?.nombreCompleto || perfil?.nombre || 'Usuario',
      role: perfil?.nombreRol || perfil?.rol || 'Sin rol'
    };

    this.genero = perfil?.genero || perfil?.sexo || null;

    // Inicializar stats desde el perfil con datos de ejemplo
    this.stats = {
      totalUsers: perfil?.totalUsuarios || 10,
      emprendimientos: perfil?.totalEmprendimientos || 20,
      totalVisits: perfil?.totalVisitas || 10
    };

    // Cargar datos de la API
    this.cargarDatos();
  }

cargarDatos() {
  this.isLoading = true;
  this.errorMessage = '';

  forkJoin({
    menosVistos: this.dashboardService.getEmprendimientosMenosVistos().pipe(
      catchError((error) => {
        console.warn('Error al cargar emprendimientos menos vistos:', error);
        return of([]);
      })
    ),
    masVistos: this.dashboardService.getTopEmprendimientos().pipe(
      catchError((error) => {
        console.warn('Error al cargar emprendimientos más vistos:', error);
        return of([]);
      })
    ),
    mejorValorados: this.dashboardService.getEmprendimientosMejorValorados().pipe(
      catchError((error) => {
        console.warn('Error al cargar emprendimientos mejor valorados:', error);
        return of([]);
      })
    ),
    peorValorados: this.dashboardService.getEmprendimientosPeorValorados().pipe(
      catchError((error) => {
        console.warn('Error al cargar emprendimientos peor valorados:', error);
        return of([]);
      })
    ),
    categoriasMasVistas: this.dashboardService.getCategoriasMasVistas().pipe(
      catchError((error) => {
        console.warn('Error al cargar categorías más vistas:', error);
        return of([]);
      })
    ),
    formularioAutoevaluacion: this.dashboardService.obtenerFormularioAutoevaluacion().pipe(
      catchError((error) => {
        console.warn('Error al cargar formulario de autoevaluación:', error);
        return of(null);
      })
    ),
    todosEmprendimientos: this.dashboardService.getTodosEmprendimientos().pipe(
      catchError((error) => {
        console.warn('Error al cargar todos los emprendimientos:', error);
        return of([]);
      })
    ),
  }).subscribe({
    next: (data) => {
      // Cargar todos los emprendimientos para el filtro y obtener categorías
      this.todosEmprendimientos = data.todosEmprendimientos || [];

      // Procesar emprendimientos menos vistos con categoría
      this.emprendimientosMenosVistos = (data.menosVistos || []).map(emp => {
        const idEmp = emp.idEmprendimiento || emp.id || 0;
        const empDetallado = this.todosEmprendimientos.find((e: any) => e.idEmprendimiento === idEmp);
        
        // Obtener la primera categoría (principal) del array de categorías
        const categoriaPrincipal = empDetallado?.categorias && empDetallado.categorias.length > 0
          ? empDetallado.categorias[0].nombre
          : (empDetallado?.nombreCategoria || emp.categoria || '');
        
        return {
          id: emp.id || emp.idEmprendimiento || 0,
          idEmprendimiento: idEmp,
          nombreEmprendimiento: emp.nombreEmprendimiento || emp.nombre || '',
          nombre: emp.nombreEmprendimiento || emp.nombre || '', // Para compatibilidad con el template
          categoria: categoriaPrincipal,
          vistas: emp.vistas || emp.visitas || 0,
          visitas: emp.vistas || emp.visitas || 0, // Para compatibilidad con el template
          fechaRegistro: emp.fechaRegistro || '',
          iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento || emp.nombre || '')
        };
      });

      // Procesar top emprendimientos (más vistos) con categoría
      this.topEmprendimientos = (data.masVistos || []).map(emp => {
        const idEmp = emp.idEmprendimiento || emp.id || 0;
        const empDetallado = this.todosEmprendimientos.find((e: any) => e.idEmprendimiento === idEmp);
        
        // Obtener la primera categoría (principal) del array de categorías
        const categoriaPrincipal = empDetallado?.categorias && empDetallado.categorias.length > 0
          ? empDetallado.categorias[0].nombre
          : (empDetallado?.nombreCategoria || emp.categoria || '');
        
        return {
          id: emp.id || emp.idEmprendimiento || 0,
          idEmprendimiento: idEmp,
          nombreEmprendimiento: emp.nombreEmprendimiento || emp.nombre || '',
          nombre: emp.nombreEmprendimiento || emp.nombre || '', // Para compatibilidad con el template
          categoria: categoriaPrincipal,
          vistas: emp.vistas || emp.visitas || 0,
          visitas: emp.vistas || emp.visitas || 0, // Para compatibilidad con el template
          fechaRegistro: emp.fechaRegistro || '',
          iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento || emp.nombre || '')
        };
      });

      // Procesar mejor valorados (RankingGlobalDTO)
      this.emprendimientosMejorValorados = (data.mejorValorados || []).map(emp => {
        const empDetallado = this.todosEmprendimientos.find((e: any) => e.idEmprendimiento === emp.idEmprendimiento);
        
        // Obtener la primera categoría (principal) del array de categorías
        const categoriaPrincipal = empDetallado?.categorias && empDetallado.categorias.length > 0
          ? empDetallado.categorias[0].nombre
          : (empDetallado?.nombreCategoria || '');
        
        return {
          id: emp.idEmprendimiento,
          nombre: emp.nombreEmprendimiento,
          categoria: categoriaPrincipal,
          calificacion: emp.promedioGlobal,
          iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento)
        };
      });

      // Procesar peor valorados (RankingGlobalDTO)
      this.emprendimientosPeorValorados = (data.peorValorados || []).map(emp => {
        const empDetallado = this.todosEmprendimientos.find((e: any) => e.idEmprendimiento === emp.idEmprendimiento);
        
        // Obtener la primera categoría (principal) del array de categorías
        const categoriaPrincipal = empDetallado?.categorias && empDetallado.categorias.length > 0
          ? empDetallado.categorias[0].nombre
          : (empDetallado?.nombreCategoria || '');
        
        return {
          id: emp.idEmprendimiento,
          nombre: emp.nombreEmprendimiento,
          categoria: categoriaPrincipal,
          calificacion: emp.promedioGlobal,
          iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento)
        };
      });

      // Procesar categorías ordenadas de mayor a menor
      this.categoriasOrdenadas = (data.categoriasMasVistas || [])
        .sort((a, b) => (b.vistas || 0) - (a.vistas || 0));

      // Mantener la categoría principal (la primera)
      this.categoriaMasVista = this.categoriasOrdenadas.length > 0 
        ? {
            nombre: this.categoriasOrdenadas[0].categoria.nombre,
            visitas: this.categoriasOrdenadas[0].vistas,
            ejemplo: this.categoriasOrdenadas[0].categoria.descripcion || 'Categoría líder en visitas'
          }
        : null;

      // Procesar preguntas de autoevaluación
      if (data.formularioAutoevaluacion && data.formularioAutoevaluacion.preguntas) {
        // Guardar todas las preguntas para usarlas con el filtro
        this.todasLasPreguntas = data.formularioAutoevaluacion.preguntas;
        
        // Cargar rankings para las primeras 5 preguntas (sin filtro de emprendimiento)
        const preguntasLimitadas = this.todasLasPreguntas.slice(0, 5);
        this.cargarRankingsPreguntas(preguntasLimitadas, null);
      } else {
        // Si no hay formulario, usar datos mock
        this.preguntasAutoevaluacion = this.getDatosMockPreguntas();
      }

      // Actualizar stats basado en los datos recibidos
      this.stats.emprendimientos = this.topEmprendimientos.length || this.stats.emprendimientos;
      this.stats.totalVisits = this.topEmprendimientos.reduce((sum, emp) => sum + (emp.visitas || 0), 0) || this.stats.totalVisits;

      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error crítico al cargar datos del dashboard:', error);
      this.errorMessage = 'Error al conectar con el servidor. Verifica tu conexión.';
      this.isLoading = false;
    }
  });
}

  // Método auxiliar para cargar rankings de preguntas
  private cargarRankingsPreguntas(preguntas: any[], idEmprendimiento: number | null = null) {
    const rankingRequests = preguntas.map(pregunta => {
      // Solo pasar idEmprendimiento si tiene un valor válido
      const idTipoEmprendimiento = idEmprendimiento !== null ? idEmprendimiento : undefined;
      
      return this.dashboardService.getRankingPorPregunta(
        pregunta.idPregunta, 
        idTipoEmprendimiento, 
        0, 
        100
      ).pipe(
        catchError(() => of({ content: [], pageable: {} }))
      );
    });

    forkJoin(rankingRequests).subscribe({
      next: (rankings) => {
        this.preguntasAutoevaluacion = preguntas.map((pregunta, index) => {
          const ranking = rankings[index];
          const contenido = ranking?.content || [];
          
          let promedio = 0;
          
          if (idEmprendimiento) {
            // Si hay filtro de emprendimiento, buscar solo ese emprendimiento
            const emprendimientoEspecifico = contenido.find((item: any) => item.idEmprendimiento === idEmprendimiento);
            promedio = emprendimientoEspecifico?.promedioPregunta || 0;
          } else {
            // Si no hay filtro, calcular promedio de todos los emprendimientos
            promedio = contenido.length > 0
              ? contenido.reduce((sum: number, item: any) => sum + (item.promedioPregunta || 0), 0) / contenido.length
              : 0;
          }

          return {
            pregunta: pregunta.pregunta,
            promedio: promedio
          };
        });
      },
      error: (error) => {
        console.warn('Error al cargar rankings de preguntas:', error);
        this.preguntasAutoevaluacion = this.getDatosMockPreguntas();
      }
    });
  }
  // Métodos para datos mock (de ejemplo) - solo para presentar JAJA
  private getDatosMockMenosVistos(): EmprendimientoMenosVisto[] {
    return [
      { 
        id: 1, 
        idEmprendimiento: 1,
        nombreEmprendimiento: 'DigitalPulse',
        nombre: 'DigitalPulse',
        categoria: 'Educación', 
        vistas: 23,
        visitas: 23,
        fechaRegistro: new Date().toISOString()
      },
      { 
        id: 2, 
        idEmprendimiento: 2,
        nombreEmprendimiento: 'Oro & Arte',
        nombre: 'Oro & Arte',
        categoria: 'Mascotas', 
        vistas: 31,
        visitas: 31,
        fechaRegistro: new Date().toISOString()
      },
      { 
        id: 3, 
        idEmprendimiento: 3,
        nombreEmprendimiento: 'SmartHome',
        nombre: 'SmartHome',
        categoria: 'Hogar', 
        vistas: 40,
        visitas: 40,
        fechaRegistro: new Date().toISOString()
      }
    ];
  }

  private getDatosMockTop(): EmprendimientoTop[] {
    return [
      { id: 4, nombre: 'EcoVerde', categoria: 'Medio Ambiente', visitas: 150, calificacion: 4.9 },
      { id: 5, nombre: 'ArtiFlex', categoria: 'Moda & Accesorios', visitas: 30, calificacion: 4.5 },
      { id: 6, nombre: 'FoodHub', categoria: 'Alimentos y Bebidas', visitas: 20, calificacion: 4.5 }
    ];
  }

  private getDatosMockMejorValorados(): EmprendimientoTop[] {
    return [
      { id: 4, nombre: 'EcoVerde', categoria: 'Sostenibilidad', calificacion: 4.9 },
      { id: 7, nombre: 'TechPro', categoria: 'Tecnología y Software', calificacion: 4.8 },
      { id: 8, nombre: 'FitLife', categoria: 'Salud y Bienestar', calificacion: 4.7 }
    ];
  }

  private getDatosMockPeorValorados(): EmprendimientoTop[] {
    return [
      { id: 1, nombre: 'BookFlex', categoria: 'Educación y Formacion', calificacion: 2.1 },
      { id: 9, nombre: 'QuickFix', categoria: 'Servicios Profesionales ', calificacion: 2.5 },
      { id: 10, nombre: 'StyleMe', categoria: 'Moda & Accesorios', calificacion: 2.8 }
    ];
  }

  private getDatosMockCategoria(): CategoriaMasVista {
    return {
      nombre: 'Moda & Accesorios',
      visitas: 3420,
      ejemplo: 'Categoría líder en visitas'
    };
  }

  private getDatosMockPreguntas(): PreguntaAutoevaluacion[] {
    return [
      { pregunta: '¿Qué crees que pudo haber causado esta experiencia negativa?', promedio: 3.8 },
      { pregunta: '¿Qué acciones estás planeando tomar para mejorar esta situación?', promedio: 4.2 },
      { pregunta: '¿Cuál de estas áreas estás priorizando actualmente en tu emprendimiento?', promedio: 4.0 }
    ];
  }

  // Aplicar filtros a preguntas de autoevaluación
  aplicarFiltros() {
    // Convertir el valor a número o null de forma segura
    let emprendimientoId: number | null = null;
    
    if (this.filtroEmprendimiento !== null && this.filtroEmprendimiento !== undefined) {
      const idNumerico = Number(this.filtroEmprendimiento);
      if (!isNaN(idNumerico)) {
        emprendimientoId = idNumerico;
      }
    }
    
    console.log('Filtros aplicados:', {
      emprendimiento: emprendimientoId,
      fecha: this.filtroFecha
    });
    
    if (this.todasLasPreguntas.length > 0) {
      // Limitar a las primeras 5 preguntas
      const preguntasLimitadas = this.todasLasPreguntas.slice(0, 5);
      
      // Recargar rankings con el filtro de emprendimiento
      this.cargarRankingsPreguntas(preguntasLimitadas, emprendimientoId);
    }
  }

  // Helper para obtener color de avatar según el índice
  getAvatarColor(index: number): string {
    const colors = [
      'bg-blue-600', 'bg-blue-400', 'bg-sky-700', 
      'bg-amber-700', 'bg-amber-600', 'bg-amber-500',
      'bg-green-600', 'bg-red-600', 'bg-blue-500',
      'bg-purple-600', 'bg-pink-600', 'bg-indigo-600'
    ];
    return colors[index % colors.length];
  }
}