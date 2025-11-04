import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEmprendimientosComponent } from './admin-emprendimientos.component';

describe('AdminEmprendimientosComponent', () => {
  let component: AdminEmprendimientosComponent;
  let fixture: ComponentFixture<AdminEmprendimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEmprendimientosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminEmprendimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
