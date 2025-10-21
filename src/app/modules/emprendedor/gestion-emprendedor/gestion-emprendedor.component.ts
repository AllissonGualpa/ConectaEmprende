import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { SeccionPersonalComponent } from './seccion-personal/seccion-personal.component';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-emprendedor',
  standalone: true,
  imports: [MatTabsModule, MatTabGroup, MatTab,CommonModule, SeccionPersonalComponent,NavbarComponent,FormsModule],
  templateUrl: './gestion-emprendedor.component.html',
})
export class GestionEmprendedor {
    selectedIndex = 0;

 }
