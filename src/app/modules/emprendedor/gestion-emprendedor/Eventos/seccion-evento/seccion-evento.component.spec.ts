import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionEventoComponent } from './seccion-evento.component';

describe('SeccionEventoComponent', () => {
  let component: SeccionEventoComponent;
  let fixture: ComponentFixture<SeccionEventoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionEventoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeccionEventoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
