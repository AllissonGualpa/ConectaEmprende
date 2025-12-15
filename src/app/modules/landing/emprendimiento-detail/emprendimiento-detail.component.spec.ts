import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EmprendimientoDetailComponent } from './emprendimiento-detail.component';

describe('EmprendimientoDetailComponent', () => {
  let component: EmprendimientoDetailComponent;
  let fixture: ComponentFixture<EmprendimientoDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmprendimientoDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmprendimientoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
