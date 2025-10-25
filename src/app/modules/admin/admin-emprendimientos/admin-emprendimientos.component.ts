import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NavbarAdminComponent } from '../../../layout/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-admin-emprendimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarAdminComponent],
  templateUrl: './admin-emprendimientos.component.html',
})
export class AdminEmprendimientosComponent implements OnInit {
  emprendimientos: any[] = [];
  tiposEmprendimiento: any[] = [];
  filteredEmprendimientos: any[] = [];
  categorias: any[] = [];
  searchTerm = '';
  selectedCategory = '';
  selectedDate = '';
  loading = false;

  private apiEmprendimientos = 'https://eureka-emprende.onrender.com/api/emprendimientos';
  private apiTipos = 'https://eureka-emprende.onrender.com/v1/tipos-emprendimiento';
  private apiCategorias = 'https://eureka-emprende.onrender.com/v1/categorias';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      tipos: this.http.get<any[]>(this.apiTipos, { headers }),
      categorias: this.http.get<any[]>(this.apiCategorias, { headers }),
      emprendimientos: this.http.get<any[]>(this.apiEmprendimientos, { headers }),
    }).subscribe({
      next: ({ tipos, categorias, emprendimientos }) => {
        this.tiposEmprendimiento = tipos;
        this.categorias = categorias;
        this.emprendimientos = emprendimientos.map(emp => {
          const tipoData = this.tiposEmprendimiento.find(t => t.id === emp.tipoEmprendimientoId);
          return {
            ...emp,
            tipoInfo: {
              tipo: tipoData ? tipoData.tipo : 'Desconocido',
              subTipo: tipoData ? tipoData.subTipo.trim() : emp.nombreTipoEmprendimiento,
            },
          };
        });
        this.filteredEmprendimientos = [...this.emprendimientos];
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar datos:', err);
        this.loading = false;
        if (err.status === 401) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  applyFilters() {
    this.filteredEmprendimientos = this.emprendimientos.filter(emp => {
      const matchesSearch =
        this.searchTerm === '' ||
        emp.nombreComercial?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        this.selectedCategory === '' || emp.categoriaId == this.selectedCategory;
      const matchesDate =
        this.selectedDate === '' ||
        new Date(emp.fechaCreacion).toISOString().split('T')[0] === this.selectedDate;
      return matchesSearch && matchesCategory && matchesDate;
    });
  }

  reload() {
    this.searchTerm = '';
    this.selectedCategory = '';
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

  eliminarEmprendimiento(emp: any) {
    if (confirm(`¿Seguro que deseas eliminar el emprendimiento "${emp.nombreComercial}"?`)) {
      console.log('Eliminando emprendimiento con ID:', emp.id);
    }
  }
}
