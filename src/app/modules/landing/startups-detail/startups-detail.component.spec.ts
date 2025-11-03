import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartupsDetailComponent } from './startups-detail.component';

describe('StartupsDetailComponent', () => {
  let component: StartupsDetailComponent;
  let fixture: ComponentFixture<StartupsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupsDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StartupsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
