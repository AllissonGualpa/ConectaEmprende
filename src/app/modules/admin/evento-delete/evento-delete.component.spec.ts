import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoDeleteComponent } from './evento-delete.component';

describe('EventoDeleteComponent', () => {
  let component: EventoDeleteComponent;
  let fixture: ComponentFixture<EventoDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoDeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventoDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
