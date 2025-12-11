import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { SeccionPersonalComponent } from './seccion-personal/seccion-personal.component';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { SeccionEventoComponent } from './seccion-evento/seccion-evento.component'; 
import { SeccionEmprendimientoComponent } from './seccion-emprendimiento/seccion-emprendimiento.component';
import { FooterComponent } from '../../../layout/footer/footer.component';

@Component({
  selector: 'app-gestion-emprendedor',
  standalone: true,
  imports: [MatTabsModule, MatTabGroup,FooterComponent, MatTab,CommonModule, SeccionPersonalComponent,NavbarComponent,FormsModule, SeccionEventoComponent, SeccionEmprendimientoComponent],
  templateUrl: './gestion-emprendedor.component.html',
})
export class GestionEmprendedor {
    selectedIndex = 0;

 }
