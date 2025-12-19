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
  CategoriaConVistas
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
  todosEmprendimientos: EmprendimientoTop[] = [];

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
    filtrosMetricas: this.dashboardService.getFiltrosMetricas().pipe(
      catchError((error) => {
        console.warn('Error al cargar métricas filtradas:', error);
        return of([]);
      })
    ),
    mejorValorados: this.dashboardService.getEmprendimientosMejorValorados().pipe(
      catchError((error) => {
        console.warn('Error al cargar emprendimientos mejor valorados:', error);
        return of(this.getDatosMockMejorValorados());
      })
    ),
    peorValorados: this.dashboardService.getEmprendimientosPeorValorados().pipe(
      catchError((error) => {
        console.warn('Error al cargar emprendimientos peor valorados:', error);
        return of(this.getDatosMockPeorValorados());
      })
    ),
    categoriasMasVistas: this.dashboardService.getCategoriasMasVistas().pipe(
      catchError((error) => {
        console.warn('Error al cargar categorías más vistas:', error);
        return of([]); // ← CAMBIO AQUÍ: retornar array vacío, no objeto
      })
    ),
  }).subscribe({
    next: (data) => {
      // Procesar datos de filtrosMetricas
      const metricas = data.filtrosMetricas || [];
      
      // Ordenar por vistas de MAYOR a MENOR para Top Emprendimientos
      const topSorted = [...metricas].sort((a, b) => (b.vistas || 0) - (a.vistas || 0));
      this.topEmprendimientos = topSorted.map(emp => ({
        id: emp.idEmprendimiento,
        nombre: emp.nombreEmprendimiento,
        categoria: '',
        visitas: emp.vistas,
        iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento)
      }));

      // Ordenar por vistas de MENOR a MAYOR para Menos Vistos
      const menosSorted = [...metricas].sort((a, b) => (a.vistas || 0) - (b.vistas || 0));
      this.emprendimientosMenosVistos = menosSorted.map(emp => ({
        id: emp.idEmprendimiento,
        nombre: emp.nombreEmprendimiento,
        categoria: '',
        visitas: emp.vistas,
        iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento)
      }));

      // Mejor valorados
      this.emprendimientosMejorValorados = (data.mejorValorados || []).map(emp => ({
        ...emp,
        iniciales: this.dashboardService.generarIniciales(emp.nombre)
      }));

      // Peor valorados
      this.emprendimientosPeorValorados = (data.peorValorados || []).map(emp => ({
        ...emp,
        iniciales: this.dashboardService.generarIniciales(emp.nombre)
      }));

// Reemplaza esta sección:
    // Procesar categorías ordenadas de mayor a menor
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

      // Combinar todos los emprendimientos para el filtro
      this.todosEmprendimientos = [
        ...this.topEmprendimientos,
        ...this.emprendimientosMejorValorados
      ].filter((emp, index, self) => 
        index === self.findIndex((e) => e.id === emp.id)
      );

      // Datos mock para preguntas de autoevaluación
      this.preguntasAutoevaluacion = this.getDatosMockPreguntas();

      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error crítico al cargar datos del dashboard:', error);
      this.errorMessage = 'Error al conectar con el servidor. Verifica tu conexión.';
      this.isLoading = false;
    }
  });
}
  // Métodos para datos mock (de ejemplo) - solo para presentar JAJA
  private getDatosMockMenosVistos(): EmprendimientoMenosVisto[] {
    return [
      { id: 1, nombre: 'DigitalPulse', categoria: 'Educación', visitas: 23 },
      { id: 2, nombre: 'Oro & Arte', categoria: 'Mascotas', visitas: 31 },
      { id: 3, nombre: 'SmartHome', categoria: 'Hogar', visitas: 40 }
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
    // Por ahora solo filtra los datos mock
    console.log('Filtros aplicados:', {
      emprendimiento: this.filtroEmprendimiento,
      fecha: this.filtroFecha
    });
    
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