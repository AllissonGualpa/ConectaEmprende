import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmprendimientosComponent } from './emprendimientos.component';

describe('EmprendimientosComponent', () => {
  let component: EmprendimientosComponent;
  let fixture: ComponentFixture<EmprendimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmprendimientosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmprendimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
