import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';
import { Environment } from '../../../../environments/environment';
import { MensajeConfirmacionComponent } from '../../shared/components/mensaje-confirmacion/mensaje-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';

// Imports de Angular Material para que se vea como admin-blog
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';

@Component({
  selector: 'app-admin-emprendimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarAdminComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './admin-emprendimientos.component.html',
})
export class AdminEmprendimientosComponent implements OnInit {
  emprendimientos: any[] = [];
  tiposEmprendimiento: any[] = [];
  filteredEmprendimientos: any[] = [];
  categorias: any[] = [];

  // Nuevo: ciudades
  ciudades: any[] = [];
  selectedCiudad = '';

  searchTerm = '';
  selectedCategory = '';
  selectedDate: any = ''; // ya no se usará

  loading = false;

  private apiEmprendimientos =
    Environment.api_url + Environment.api_emprendimientos;
  private apiTipos = Environment.api_url + Environment.api_tipos;
  private apiCategorias = Environment.api_url + Environment.api_categorias;
  private apiCiudades = Environment.api_url + Environment.api_ciudades;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      this.loading = false;
      this.dialog.open(MensajeConfirmacionComponent, {
        width: '420px',
        data: {
          subject: 'Autenticación',
          title: 'No estás autenticado',
          subtitle: 'Por favor, inicia sesión para continuar.',
          type: 'error',
        },
      });
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Carga inicial de combos + emprendimientos sin filtros
    forkJoin({
      tipos: this.http.get<any[]>(this.apiTipos, { headers }),
      categorias: this.http.get<any[]>(this.apiCategorias, { headers }),
      ciudades: this.http.get<any[]>(this.apiCiudades, { headers }), // nuevo
      emprendimientos: this.http.get<any>(this.apiEmprendimientos, {
        headers,
      }),
    }).subscribe({
      next: ({ tipos, categorias, ciudades, emprendimientos }) => {
        this.tiposEmprendimiento = tipos;
        this.categorias = categorias;
        this.ciudades = ciudades; // llenar combo ciudades

        const lista = emprendimientos?.content ?? [];

        this.emprendimientos = this.mapEmprendimientos(lista);
        this.filteredEmprendimientos = [...this.emprendimientos];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar emprendimientos:', error);
        this.loading = false;
        if (error.status === 401) {
          this.dialog.open(MensajeConfirmacionComponent, {
            width: '420px',
            data: {
              subject: 'Sesión expirada',
              title: 'Tu sesión ha expirado',
              subtitle: 'Por favor, inicia sesión nuevamente.',
              type: 'error',
            },
          });
          this.router.navigate(['/login']);
        }
      },
    });
  }

  // Mapea la lista cruda del backend a la estructura con tipoInfo
  private mapEmprendimientos(lista: any[]): any[] {
    return lista.map(
      (emp: { tipoEmprendimientoId: any; nombreTipoEmprendimiento: any }) => {
        const tipoData = this.tiposEmprendimiento.find(
          (t) => t.id === emp.tipoEmprendimientoId
        );
        return {
          ...emp,
          tipoInfo: {
            tipo: tipoData ? tipoData.tipo : 'Desconocido',
            subTipo: tipoData
              ? tipoData.subTipo.trim()
              : emp.nombreTipoEmprendimiento,
          },
        };
      }
    );
  }

  // Llamar al backend aplicando filtros como query params
  applyFilters() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    this.loading = true;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    let params = new HttpParams();

    // nombre (buscador)
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      params = params.set('nombre', this.searchTerm.trim());
    }

    // categoría: en el HTML usas [value]="cat.nombre", por lo que ya es el nombre
    if (this.selectedCategory && this.selectedCategory !== '') {
      params = params.set('categoria', this.selectedCategory);
    }

    // Nuevo: ciudad (usamos nombreCiudad como valor del select)
    if (this.selectedCiudad && this.selectedCiudad !== '') {
      params = params.set('ciudad', this.selectedCiudad);
    }

    // Quitar lógica de fecha (selectedDate ya no se usa)

    // Paginación básica (puedes cambiar luego)
    params = params.set('page', '0').set('size', '20');

    this.http
      .get<any>(this.apiEmprendimientos, { headers, params })
      .subscribe({
        next: (resp) => {
          const lista = resp?.content ?? resp ?? [];
          this.emprendimientos = this.mapEmprendimientos(lista);
          this.filteredEmprendimientos = [...this.emprendimientos];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al aplicar filtros:', error);
          this.loading = false;
        },
      });
  }

  reload() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedCiudad = '';
    this.selectedDate = '';
    this.loadData();
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatHora(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getHoraColor(index: number): string {
    const colors = [
      'bg-green-50 text-green-700',
      'bg-blue-50 text-blue-700',
      'bg-yellow-50 text-yellow-700',
      'bg-pink-50 text-pink-700',
      'bg-purple-50 text-purple-700',
    ];
    return colors[index % colors.length];
  }

  editarEmprendimiento(emp: any) {
    this.router.navigate(['/admin/emprendimientos/edit', emp.id]);
  }

  // Botón de inactivación (ya no “eliminar”)
  desactivarEmprendimiento(emp: any) {
    const confirmado = confirm(
      `¿Seguro que deseas inactivar el emprendimiento "${emp.nombreComercial}"?`
    );

    if (!confirmado) {
      return;
    }

    // Aquí deberías llamar a tu API de inactivación cuando la tengas.
    // Ejemplo futuro:
    // this.http.patch(`${this.apiEmprendimientos}/${emp.id}/inactivar`, {}, { headers }).subscribe(...)

    console.log('Inactivando emprendimiento con ID:', emp.id);
  }
}
