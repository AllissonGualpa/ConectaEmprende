import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarAdminComponent } from '../../../../shared/components/navbar-admin/navbar-admin.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarAdminComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  user = {
    name: 'John Doe',
    role: 'Administrador'
  };

  stats = {
    totalUsers: 1248,
    emprendimientos: 1248,
    totalVisits: 1248
  };

  ngOnInit() {}
}
