import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { AuthService } from '../../auth/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { 
  EmprendimientoMenosVisto,
  EmprendimientoTop,
  CategoriaMasVista,
  PreguntaAutoevaluacion, 
  CategoriaConVistas,
  RankingGlobalDTO
} from '../../../core/types/dashboard.types';
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

  // Datos para el gráfico temporal
  datosGraficoTemporal: { mes: string, cantidad: number, acumulado: number }[] = [];
  puntosGrafico: { x: number, y: number, valor: number, label: string, labelCorto: string }[] = [];
  pathLineaGrafico: string = '';
  pathAreaGrafico: string = '';
  anchoGrafico: number = 960;
  maxEmprendimientos: number = 0;
  totalEmprendimientos: number = 0;
  ultimoMesCantidad: number = 0;

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

      // Procesar datos temporales para el gráfico
      this.procesarDatosTemporales();

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

  // Obtener el valor máximo de visitas de categorías para el gráfico
  get maxVisitasCategoria(): number {
    if (this.categoriasOrdenadas.length === 0) return 1;
    return Math.max(...this.categoriasOrdenadas.map(c => c.vistas));
  }

  // Obtener el total de visitas de todas las categorías
  get totalVisitasCategoria(): number {
    return this.categoriasOrdenadas.reduce((sum, c) => sum + c.vistas, 0) || 1;
  }

  // Procesar datos temporales para el gráfico de línea
  private procesarDatosTemporales() {
    if (!this.todosEmprendimientos || this.todosEmprendimientos.length === 0) {
      this.datosGraficoTemporal = [];
      return;
    }

    // Agrupar emprendimientos por mes
    const emprendimientosPorMes: { [key: string]: number } = {};
    
    this.todosEmprendimientos.forEach(emp => {
      // Intentar obtener la fecha de diferentes campos posibles
      const fechaPosible = emp.fechaRegistro || emp.fechaCreacion || emp.createdAt || emp.fecha || emp.fechaAlta;
      
      if (fechaPosible) {
        try {
          const fecha = new Date(fechaPosible);
          
          // Validar que la fecha sea válida
          if (!isNaN(fecha.getTime())) {
            const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            emprendimientosPorMes[mesAnio] = (emprendimientosPorMes[mesAnio] || 0) + 1;
          }
        } catch (e) {
          // Ignorar fechas inválidas
        }
      }
    });

    // Ordenar por fecha y calcular acumulado
    const mesesOrdenados = Object.keys(emprendimientosPorMes).sort();
    let acumulado = 0;
    
    this.datosGraficoTemporal = mesesOrdenados.map(mes => {
      acumulado += emprendimientosPorMes[mes];
      return {
        mes,
        cantidad: emprendimientosPorMes[mes],
        acumulado
      };
    });

    // Si no hay datos con fechas, usar el total de emprendimientos en el mes actual
    if (this.datosGraficoTemporal.length === 0 && this.todosEmprendimientos.length > 0) {
      const hoy = new Date();
      const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
      this.datosGraficoTemporal = [{
        mes: mesActual,
        cantidad: this.todosEmprendimientos.length,
        acumulado: this.todosEmprendimientos.length
      }];
    }

    // Si hay pocos meses de datos (menos de 6), extender con los últimos 6 meses
    if (this.datosGraficoTemporal.length > 0 && this.datosGraficoTemporal.length < 6) {
      const hoy = new Date();
      const ultimosMeses: { mes: string, cantidad: number, acumulado: number }[] = [];
      
      // Generar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        const cantidad = emprendimientosPorMes[mesAnio] || 0;
        const acumuladoPrevio = ultimosMeses.length > 0 
          ? ultimosMeses[ultimosMeses.length - 1].acumulado 
          : 0;
        ultimosMeses.push({ 
          mes: mesAnio, 
          cantidad, 
          acumulado: acumuladoPrevio + cantidad 
        });
      }
      
      this.datosGraficoTemporal = ultimosMeses;
    } else if (this.datosGraficoTemporal.length >= 6) {
      // Limitar a los últimos 12 meses
      this.datosGraficoTemporal = this.datosGraficoTemporal.slice(-12);
    }

    this.totalEmprendimientos = this.datosGraficoTemporal.length > 0 
      ? this.datosGraficoTemporal[this.datosGraficoTemporal.length - 1].acumulado 
      : this.todosEmprendimientos.length;
    
    this.ultimoMesCantidad = this.datosGraficoTemporal.length > 0
      ? this.datosGraficoTemporal[this.datosGraficoTemporal.length - 1].cantidad
      : 0;

    // Generar puntos del gráfico
    this.generarPuntosGrafico();
  }

  private generarPuntosGrafico() {
    if (this.datosGraficoTemporal.length === 0) {
      this.puntosGrafico = [];
      this.pathLineaGrafico = '';
      this.pathAreaGrafico = '';
      return;
    }

    const margenIzq = 50;
    const margenDer = 20;
    const margenSup = 30;
    const margenInf = 40;
    const alturaGrafico = 240;
    const anchoUtil = this.anchoGrafico - margenIzq - margenDer;
    const alturaUtil = alturaGrafico - margenSup - margenInf;

    this.maxEmprendimientos = Math.max(...this.datosGraficoTemporal.map(d => d.acumulado), 1);
    const numPuntos = this.datosGraficoTemporal.length;
    const espacioEntrePuntos = anchoUtil / Math.max(numPuntos - 1, 1);

    // Generar puntos
    this.puntosGrafico = this.datosGraficoTemporal.map((dato, index) => {
      const x = margenIzq + (index * espacioEntrePuntos);
      const y = alturaGrafico - margenInf - ((dato.acumulado / this.maxEmprendimientos) * alturaUtil);
      
      // Formatear etiqueta del mes
      const [anio, mes] = dato.mes.split('-');
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const labelCorto = meses[parseInt(mes) - 1] || mes;
      const label = `${labelCorto} ${anio}`;

      return { x, y, valor: dato.acumulado, label, labelCorto };
    });

    // Generar path para la línea
    this.pathLineaGrafico = this.puntosGrafico
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    // Generar path para el área
    const puntosArea = [
      `M ${this.puntosGrafico[0].x} ${alturaGrafico - margenInf}`,
      ...this.puntosGrafico.map(p => `L ${p.x} ${p.y}`),
      `L ${this.puntosGrafico[this.puntosGrafico.length - 1].x} ${alturaGrafico - margenInf}`,
      'Z'
    ];
    this.pathAreaGrafico = puntosArea.join(' ');
  }
}