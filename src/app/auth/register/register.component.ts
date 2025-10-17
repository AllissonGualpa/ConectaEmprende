import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from "@angular/material/icon";
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from '../../shared/adapters/CustomDateAdapter';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-register',
  standalone: true,
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    MatError,
    MatDatepickerModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  hide = true;
  hideConfirm = true;

  mostrarCamposEstudiante = false;
  mostrarCampoPariente = false;

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;

  // ✅ Provincias y ciudades de Ecuador
  provincias = [
    { nombre: 'Azuay', ciudades: ['Cuenca', 'Gualaceo', 'Paute', 'Sígsig'] },
    { nombre: 'Bolívar', ciudades: ['Guaranda', 'San Miguel', 'Echeandía'] },
    { nombre: 'Cañar', ciudades: ['Azogues', 'Biblián', 'La Troncal'] },
    { nombre: 'Carchi', ciudades: ['Tulcán', 'Mira', 'Montúfar'] },
    { nombre: 'Chimborazo', ciudades: ['Riobamba', 'Guano', 'Alausí'] },
    { nombre: 'Cotopaxi', ciudades: ['Latacunga', 'La Maná', 'Salcedo'] },
    { nombre: 'El Oro', ciudades: ['Machala', 'Pasaje', 'Santa Rosa'] },
    { nombre: 'Esmeraldas', ciudades: ['Esmeraldas', 'Atacames', 'Quinindé'] },
    { nombre: 'Galápagos', ciudades: ['Puerto Ayora', 'Puerto Baquerizo Moreno'] },
    { nombre: 'Guayas', ciudades: ['Guayaquil', 'Daule', 'Samborondón', 'Milagro'] },
    { nombre: 'Imbabura', ciudades: ['Ibarra', 'Otavalo', 'Cotacachi'] },
    { nombre: 'Loja', ciudades: ['Loja', 'Catamayo', 'Macará'] },
    { nombre: 'Los Ríos', ciudades: ['Babahoyo', 'Quevedo', 'Vinces'] },
    { nombre: 'Manabí', ciudades: ['Portoviejo', 'Manta', 'Chone'] },
    { nombre: 'Morona Santiago', ciudades: ['Macas', 'Sucúa', 'Gualaquiza'] },
    { nombre: 'Napo', ciudades: ['Tena', 'Archidona'] },
    { nombre: 'Orellana', ciudades: ['Francisco de Orellana', 'Dayuma'] },
    { nombre: 'Pastaza', ciudades: ['Puyo', 'Mera'] },
    { nombre: 'Pichincha', ciudades: ['Quito', 'Cayambe', 'Sangolquí'] },
    { nombre: 'Santa Elena', ciudades: ['Santa Elena', 'La Libertad', 'Salinas'] },
    { nombre: 'Santo Domingo de los Tsáchilas', ciudades: ['Santo Domingo'] },
    { nombre: 'Sucumbíos', ciudades: ['Nueva Loja', 'Shushufindi'] },
    { nombre: 'Tungurahua', ciudades: ['Ambato', 'Baños', 'Pelileo'] },
    { nombre: 'Zamora Chinchipe', ciudades: ['Zamora', 'Yantzaza'] },
  ];

  ciudadesFiltradas: string[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('es-ES');
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correoUees: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', Validators.required],
      genero: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.secondFormGroup = this._formBuilder.group({
      correo: ['', [Validators.required, Validators.email]],
      identificacion: ['', Validators.required],
      carrera: [''],
      anioEstudio: [''],
      parienteDirecto: ['', Validators.required],
      nombrePariente: ['']
    });

    this.thirdFormGroup = this._formBuilder.group({
      nombreComercialEmprendimiento: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      provincia: ['', Validators.required],
      ciudad: ['', Validators.required],
      estadoEmprendimiento: ['', Validators.required],
      tipoEmprendimiento: ['', Validators.required]
    });

    // 🔹 Mostrar campos de estudiante según selección
    this.secondFormGroup.get('identificacion')?.valueChanges.subscribe((value) => {
      const carreraControl = this.secondFormGroup.get('carrera');
      const anioControl = this.secondFormGroup.get('anioEstudio');

      if (value === 'Estudiante') {
        this.mostrarCamposEstudiante = true;
        carreraControl?.setValidators([Validators.required]);
        anioControl?.setValidators([Validators.required]);
      } else {
        this.mostrarCamposEstudiante = false;
        carreraControl?.clearValidators();
        anioControl?.clearValidators();
        carreraControl?.setValue('');
        anioControl?.setValue('');
      }
      carreraControl?.updateValueAndValidity();
      anioControl?.updateValueAndValidity();
    });

    // 🔹 Mostrar campo pariente según selección
    this.secondFormGroup.get('parienteDirecto')?.valueChanges.subscribe((value) => {
      const nombreParienteControl = this.secondFormGroup.get('nombrePariente');
      if (value === 'si') {
        this.mostrarCampoPariente = true;
        nombreParienteControl?.setValidators([Validators.required]);
      } else {
        this.mostrarCampoPariente = false;
        nombreParienteControl?.clearValidators();
        nombreParienteControl?.setValue('');
      }
      nombreParienteControl?.updateValueAndValidity();
    });

    // 🔹 Filtrar ciudades según la provincia seleccionada
    this.thirdFormGroup.get('provincia')?.valueChanges.subscribe((provinciaSeleccionada) => {
      const provincia = this.provincias.find(p => p.nombre === provinciaSeleccionada);
      this.ciudadesFiltradas = provincia ? provincia.ciudades : [];
      this.thirdFormGroup.get('ciudad')?.setValue('');
    });
  }

  shouldShowError(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.invalid && (control.touched || formGroup.valid));
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  guardar() {
    if (this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid) {
      const data = {
        ...this.firstFormGroup.value,
        ...this.secondFormGroup.value,
        ...this.thirdFormGroup.value
      };
      console.log('Formulario completo:', data);
    } else {
      console.log('Formulario inválido');
    }
  }
}
