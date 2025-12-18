import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionMensajeriaComponent } from './seccion-mensajeria.component';

describe('SeccionMensajeriaComponent', () => {
  let component: SeccionMensajeriaComponent;
  let fixture: ComponentFixture<SeccionMensajeriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionMensajeriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeccionMensajeriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
