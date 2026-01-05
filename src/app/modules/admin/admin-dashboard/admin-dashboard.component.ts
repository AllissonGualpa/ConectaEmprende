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

    const emprendimientosPorMes = this.agruparEmprendimientosPorMes();
    this.datosGraficoTemporal = this.generarDatosTemporales(emprendimientosPorMes);
    this.actualizarTotalesGrafico();
    this.generarPuntosGrafico();
  }

  // Agrupar emprendimientos por mes
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

  // Generar datos temporales con acumulado
  private generarDatosTemporales(emprendimientosPorMes: { [key: string]: number }): { mes: string, cantidad: number, acumulado: number }[] {
    const mesesOrdenados = Object.keys(emprendimientosPorMes).sort();
    
    if (mesesOrdenados.length === 0) {
      return this.generarDatosMesActual();
    }

    let acumulado = 0;
    const datos = mesesOrdenados.map(mes => {
      acumulado += emprendimientosPorMes[mes];
      return { mes, cantidad: emprendimientosPorMes[mes], acumulado };
    });

    return this.normalizarDatosTemporales(datos, emprendimientosPorMes);
  }

  // Generar datos para el mes actual si no hay datos
  private generarDatosMesActual(): { mes: string, cantidad: number, acumulado: number }[] {
    if (this.todosEmprendimientos.length === 0) return [];
    
    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    return [{ mes: mesActual, cantidad: this.todosEmprendimientos.length, acumulado: this.todosEmprendimientos.length }];
  }

  // Normalizar datos temporales (extender o limitar según necesidad)
  private normalizarDatosTemporales(
    datos: { mes: string, cantidad: number, acumulado: number }[], 
    emprendimientosPorMes: { [key: string]: number }
  ): { mes: string, cantidad: number, acumulado: number }[] {
    if (datos.length < 6) {
      return this.extenderUltimosSeisMeses(emprendimientosPorMes);
    }
    
    if (datos.length >= 6) {
      return datos.slice(-12); // Limitar a últimos 12 meses
    }
    
    return datos;
  }

  // Extender con los últimos 6 meses
  private extenderUltimosSeisMeses(emprendimientosPorMes: { [key: string]: number }): { mes: string, cantidad: number, acumulado: number }[] {
    const hoy = new Date();
    const ultimosMeses: { mes: string, cantidad: number, acumulado: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const cantidad = emprendimientosPorMes[mesAnio] || 0;
      const acumuladoPrevio = ultimosMeses.length > 0 ? ultimosMeses[ultimosMeses.length - 1].acumulado : 0;
      
      ultimosMeses.push({ mes: mesAnio, cantidad, acumulado: acumuladoPrevio + cantidad });
    }
    
    return ultimosMeses;
  }

  // Actualizar totales del gráfico
  private actualizarTotalesGrafico() {
    const ultimoDato = this.datosGraficoTemporal[this.datosGraficoTemporal.length - 1];
    
    this.totalEmprendimientos = ultimoDato?.acumulado || this.todosEmprendimientos.length;
    this.ultimoMesCantidad = ultimoDato?.cantidad || 0;
  }

  private generarPuntosGrafico() {
    if (this.datosGraficoTemporal.length === 0) {
      this.limpiarGrafico();
      return;
    }

    const configuracion = this.obtenerConfiguracionGrafico();
    this.maxEmprendimientos = Math.max(...this.datosGraficoTemporal.map(d => d.acumulado), 1);
    
    this.puntosGrafico = this.calcularPuntosGrafico(configuracion);
    this.pathLineaGrafico = this.generarPathLinea();
    this.pathAreaGrafico = this.generarPathArea(configuracion.alturaGrafico, configuracion.margenInf);
  }

  // Limpiar gráfico
  private limpiarGrafico() {
    this.puntosGrafico = [];
    this.pathLineaGrafico = '';
    this.pathAreaGrafico = '';
  }

  // Obtener configuración del gráfico
  private obtenerConfiguracionGrafico() {
    return {
      margenIzq: 50,
      margenDer: 20,
      margenSup: 30,
      margenInf: 40,
      alturaGrafico: 240,
      anchoUtil: this.anchoGrafico - 50 - 20,
      alturaUtil: 240 - 30 - 40
    };
  }

  // Calcular puntos del gráfico
  private calcularPuntosGrafico(config: any): { x: number, y: number, valor: number, label: string, labelCorto: string }[] {
    const numPuntos = this.datosGraficoTemporal.length;
    const espacioEntrePuntos = config.anchoUtil / Math.max(numPuntos - 1, 1);

    return this.datosGraficoTemporal.map((dato, index) => {
      const x = config.margenIzq + (index * espacioEntrePuntos);
      const y = config.alturaGrafico - config.margenInf - ((dato.acumulado / this.maxEmprendimientos) * config.alturaUtil);
      
      const [anio, mes] = dato.mes.split('-');
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const labelCorto = meses[parseInt(mes) - 1] || mes;
      const label = `${labelCorto} ${anio}`;

      return { x, y, valor: dato.acumulado, label, labelCorto };
    });
  }

  // Generar path para la línea
  private generarPathLinea(): string {
    return this.puntosGrafico
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }

  // Generar path para el área
  private generarPathArea(alturaGrafico: number, margenInf: number): string {
    const primerPunto = this.puntosGrafico[0];
    const ultimoPunto = this.puntosGrafico[this.puntosGrafico.length - 1];
    
    const puntosArea = [
      `M ${primerPunto.x} ${alturaGrafico - margenInf}`,
      ...this.puntosGrafico.map(p => `L ${p.x} ${p.y}`),
      `L ${ultimoPunto.x} ${alturaGrafico - margenInf}`,
      'Z'
    ];
    
    return puntosArea.join(' ');
  }
}