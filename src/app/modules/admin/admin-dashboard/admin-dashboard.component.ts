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

  // Ranking por preguntas
  preguntasServicio: any[] = [];
  preguntasProducto: any[] = [];
  rankingPorPregunta: any = null;
  tipoEvaluacionSeleccionado: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO' = 'EVALUACION_SERVICIO';

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
    
    // Cargar preguntas de formularios
    this.cargarPreguntasFormularios();
  }

  cargarDatos() {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      menosVistos: this.dashboardService.getEmprendimientosMenosVistos().pipe(catchError(() => of([]))),
      masVistos: this.dashboardService.getTopEmprendimientos().pipe(catchError(() => of([]))),
      mejorValorados: this.dashboardService.getEmprendimientosMejorValorados().pipe(catchError(() => of([]))),
      peorValorados: this.dashboardService.getEmprendimientosPeorValorados().pipe(catchError(() => of([]))),
      categoriasMasVistas: this.dashboardService.getCategoriasMasVistas().pipe(catchError(() => of([]))),
      formularioAutoevaluacion: this.dashboardService.obtenerFormularioAutoevaluacion().pipe(catchError(() => of(null))),
      todosEmprendimientos: this.dashboardService.getTodosEmprendimientos().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (data) => {
        this.todosEmprendimientos = data.todosEmprendimientos || [];
        
        this.procesarEmprendimientos(data);
        this.procesarCategorias(data.categoriasMasVistas);
        this.procesarPreguntasAutoevaluacion(data.formularioAutoevaluacion);
        this.actualizarEstadisticas();
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

  // Método para procesar todos los tipos de emprendimientos
  private procesarEmprendimientos(data: any) {
    this.emprendimientosMenosVistos = this.mapearEmprendimientosConVistas(data.menosVistos || []);
    this.topEmprendimientos = this.mapearEmprendimientosConVistas(data.masVistos || []);
    this.emprendimientosMejorValorados = this.mapearEmprendimientosValorados(data.mejorValorados || []);
    this.emprendimientosPeorValorados = this.mapearEmprendimientosValorados(data.peorValorados || []);
  }

  // Mapear emprendimientos con vistas (para menos vistos y más vistos)
  private mapearEmprendimientosConVistas(emprendimientos: any[]): any[] {
    return emprendimientos.map(emp => {
      const idEmp = emp.idEmprendimiento || emp.id || 0;
      const categoria = this.obtenerCategoriaPrincipal(idEmp, emp.categoria);
      const nombre = emp.nombreEmprendimiento || emp.nombre || '';
      
      return {
        id: emp.id || idEmp || 0,
        idEmprendimiento: idEmp,
        nombreEmprendimiento: nombre,
        nombre: nombre,
        categoria: categoria,
        vistas: emp.vistas || emp.visitas || 0,
        visitas: emp.vistas || emp.visitas || 0,
        fechaRegistro: emp.fechaRegistro || '',
        iniciales: this.dashboardService.generarIniciales(nombre)
      };
    });
  }

  // Mapear emprendimientos valorados (para mejor y peor valorados)
  private mapearEmprendimientosValorados(emprendimientos: RankingGlobalDTO[]): EmprendimientoTop[] {
    return emprendimientos.map(emp => {
      const categoria = this.obtenerCategoriaPrincipal(emp.idEmprendimiento);
      
      return {
        id: emp.idEmprendimiento,
        nombre: emp.nombreEmprendimiento,
        categoria: categoria,
        calificacion: emp.promedioGlobal,
        iniciales: this.dashboardService.generarIniciales(emp.nombreEmprendimiento)
      };
    });
  }

  // Obtener la categoría principal de un emprendimiento
  private obtenerCategoriaPrincipal(idEmprendimiento: number, categoriaFallback: string = ''): string {
    const empDetallado = this.todosEmprendimientos.find((e: any) => e.idEmprendimiento === idEmprendimiento);
    
    if (empDetallado?.categorias && empDetallado.categorias.length > 0) {
      return empDetallado.categorias[0].nombre;
    }
    
    return empDetallado?.nombreCategoria || categoriaFallback || '';
  }

  // Procesar categorías más vistas
  private procesarCategorias(categoriasMasVistas: CategoriaConVistas[] | null) {
    this.categoriasOrdenadas = (categoriasMasVistas || [])
      .sort((a, b) => (b.vistas || 0) - (a.vistas || 0));

    this.categoriaMasVista = this.categoriasOrdenadas.length > 0 
      ? {
          nombre: this.categoriasOrdenadas[0].categoria.nombre,
          visitas: this.categoriasOrdenadas[0].vistas,
          ejemplo: this.categoriasOrdenadas[0].categoria.descripcion || 'Categoría líder en visitas'
        }
      : null;
  }

  // Procesar preguntas de autoevaluación
  private procesarPreguntasAutoevaluacion(formulario: any) {
    if (formulario && formulario.preguntas) {
      this.todasLasPreguntas = formulario.preguntas;
      const preguntasLimitadas = this.todasLasPreguntas.slice(0, 5);
      this.cargarRankingsPreguntas(preguntasLimitadas, null);
    } else {
      this.preguntasAutoevaluacion = this.getDatosMockPreguntas();
    }
  }

  // Actualizar estadísticas del dashboard
  private actualizarEstadisticas() {
    this.stats.emprendimientos = this.topEmprendimientos.length || this.stats.emprendimientos;
    this.stats.totalVisits = this.topEmprendimientos.reduce((sum, emp) => sum + (emp.visitas || 0), 0) || this.stats.totalVisits;
  }

  // Método auxiliar para cargar rankings de preguntas
  private cargarRankingsPreguntas(preguntas: any[], idEmprendimiento: number | null = null) {
    const rankingRequests = preguntas.map(pregunta => 
      this.dashboardService.getRankingPorPregunta(
        pregunta.idPregunta, 
        idEmprendimiento !== null ? idEmprendimiento : undefined, 
        0, 
        100
      ).pipe(catchError(() => of({ content: [], pageable: {} })))
    );

    forkJoin(rankingRequests).subscribe({
      next: (rankings) => {
        this.preguntasAutoevaluacion = preguntas.map((pregunta, index) => ({
          pregunta: pregunta.pregunta,
          promedio: this.calcularPromedioRanking(rankings[index], idEmprendimiento)
        }));
      },
      error: (error) => {
        console.warn('Error al cargar rankings de preguntas:', error);
        this.preguntasAutoevaluacion = this.getDatosMockPreguntas();
      }
    });
  }

  // Calcular promedio según ranking y filtro
  private calcularPromedioRanking(ranking: any, idEmprendimiento: number | null): number {
    const contenido = ranking?.content || [];
    
    if (idEmprendimiento) {
      const emprendimientoEspecifico = contenido.find((item: any) => item.idEmprendimiento === idEmprendimiento);
      return emprendimientoEspecifico?.promedioPregunta || 0;
    }
    
    return contenido.length > 0
      ? contenido.reduce((sum: number, item: any) => sum + (item.promedioPregunta || 0), 0) / contenido.length
      : 0;
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
    const emprendimientoId = this.validarIdEmprendimiento(this.filtroEmprendimiento);
    
    if (this.todasLasPreguntas.length > 0) {
      const preguntasLimitadas = this.todasLasPreguntas.slice(0, 5);
      this.cargarRankingsPreguntas(preguntasLimitadas, emprendimientoId);
    }
  }

  // Validar y convertir ID de emprendimiento
  private validarIdEmprendimiento(valor: any): number | null {
    if (valor === null || valor === undefined) return null;
    
    const idNumerico = Number(valor);
    return !isNaN(idNumerico) ? idNumerico : null;
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

  // Obtener ranking por pregunta
  obtenerRankingPorPregunta(idPregunta: number) {
    this.dashboardService.getRankingPorPregunta(idPregunta, undefined, 0, 10)
      .subscribe({
        next: (response) => {
          this.rankingPorPregunta = response;
        },
        error: (error) => {
          console.error('Error al obtener ranking por pregunta:', error);
        }
      });
  }

  // Cambiar tipo de evaluación
  cambiarTipoEvaluacion(tipo: 'EVALUACION_SERVICIO' | 'EVALUACION_PRODUCTO') {
    this.tipoEvaluacionSeleccionado = tipo;
    this.rankingPorPregunta = null; // Limpiar ranking al cambiar tipo
  }

  // Cargar preguntas de formularios
  cargarPreguntasFormularios() {
    // Cargar preguntas de servicio
    this.dashboardService.obtenerFormularioServicio()
      .subscribe({
        next: (formulario) => {
          this.preguntasServicio = formulario.preguntas || [];
        },
        error: (error) => console.error('Error al cargar preguntas de servicio:', error)
      });

    // Cargar preguntas de producto
    this.dashboardService.obtenerFormularioProducto()
      .subscribe({
        next: (formulario) => {
          this.preguntasProducto = formulario.preguntas || [];
        },
        error: (error) => console.error('Error al cargar preguntas de producto:', error)
      });
  }

  // ============================================
  // MÉTODOS PARA EL GRÁFICO TEMPORAL
  // ============================================
  
  private procesarDatosTemporales() {
    if (!this.todosEmprendimientos || this.todosEmprendimientos.length === 0) {
      this.datosGraficoTemporal = [];
      return;
    }

    const emprendimientosPorMes = this.agruparEmprendimientosPorMes();
    this.datosGraficoTemporal = this.generarDatosTemporales(emprendimientosPorMes);
    this.actualizarTotalesGrafico();
    this.generarPuntosGrafico();
  }

  private agruparEmprendimientosPorMes(): { [key: string]: number } {
    const emprendimientosPorMes: { [key: string]: number } = {};
    
    this.todosEmprendimientos.forEach(emp => {
      const fechaPosible = emp.fechaRegistro || emp.fechaCreacion || emp.createdAt || emp.fecha || emp.fechaAlta;
      
      if (fechaPosible) {
        try {
          const fecha = new Date(fechaPosible);
          
          if (!isNaN(fecha.getTime())) {
            const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            emprendimientosPorMes[mesAnio] = (emprendimientosPorMes[mesAnio] || 0) + 1;
          }
        } catch (e) {
          // Ignorar fechas inválidas
        }
      }
    });

    return emprendimientosPorMes;
  }

  private generarDatosTemporales(emprendimientosPorMes: { [key: string]: number }): { mes: string, cantidad: number, acumulado: number }[] {
    const mesesOrdenados = Object.keys(emprendimientosPorMes).sort();
    
    if (mesesOrdenados.length === 0) {
      return [];
    }

    // Si solo hay 1 o 2 meses con datos, generar datos de demostración para visualización
    if (mesesOrdenados.length <= 2) {
      return this.generarDatosTemporalesDemo(emprendimientosPorMes);
    }

    let acumulado = 0;
    return mesesOrdenados.map(mes => {
      acumulado += emprendimientosPorMes[mes];
      return { mes, cantidad: emprendimientosPorMes[mes], acumulado };
    });
  }

  private generarDatosTemporalesDemo(emprendimientosPorMes: { [key: string]: number }): { mes: string, cantidad: number, acumulado: number }[] {
    const fechaActual = new Date();
    const resultado: { mes: string, cantidad: number, acumulado: number }[] = [];
    const totalEmprendimientos = Object.values(emprendimientosPorMes).reduce((sum, val) => sum + val, 0);
    
    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      let cantidad = 0;
      if (i === 0) {
        // El mes actual tiene todos los emprendimientos
        cantidad = totalEmprendimientos;
      } else if (i === 1) {
        // El mes anterior no tiene emprendimientos
        cantidad = 0;
      }
      
      const acumulado = i === 0 ? totalEmprendimientos : 0;
      resultado.push({ mes: mesAnio, cantidad, acumulado });
    }
    
    return resultado;
  }

  private actualizarTotalesGrafico() {
    const ultimoDato = this.datosGraficoTemporal[this.datosGraficoTemporal.length - 1];
    
    this.totalEmprendimientos = ultimoDato?.acumulado || this.todosEmprendimientos.length;
    this.ultimoMesCantidad = ultimoDato?.cantidad || 0;
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

    this.puntosGrafico = this.datosGraficoTemporal.map((dato, index) => {
      const x = margenIzq + (index * espacioEntrePuntos);
      const y = alturaGrafico - margenInf - ((dato.acumulado / this.maxEmprendimientos) * alturaUtil);
      
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
    const primerPunto = this.puntosGrafico[0];
    const ultimoPunto = this.puntosGrafico[this.puntosGrafico.length - 1];
    
    const puntosArea = [
      `M ${primerPunto.x} ${alturaGrafico - margenInf}`,
      ...this.puntosGrafico.map(p => `L ${p.x} ${p.y}`),
      `L ${ultimoPunto.x} ${alturaGrafico - margenInf}`,
      'Z'
    ];
    
    this.pathAreaGrafico = puntosArea.join(' ');
  }
}