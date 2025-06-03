import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionByPlanetComponent } from './mission-by-planet.component';

describe('MissionByPlanetComponent', () => {
  let component: MissionByPlanetComponent;
  let fixture: ComponentFixture<MissionByPlanetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionByPlanetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionByPlanetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
