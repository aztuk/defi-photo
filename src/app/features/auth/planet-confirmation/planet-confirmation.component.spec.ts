import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetConfirmationComponent } from './planet-confirmation.component';

describe('PlanetConfirmationComponent', () => {
  let component: PlanetConfirmationComponent;
  let fixture: ComponentFixture<PlanetConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
