import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventoComponent } from './admin-evento.component';

describe('AdminEventoComponent', () => {
  let component: AdminEventoComponent;
  let fixture: ComponentFixture<AdminEventoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminEventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
