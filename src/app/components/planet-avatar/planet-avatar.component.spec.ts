import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetAvatarComponent } from './planet-avatar.component';

describe('PlanetAvatarComponent', () => {
  let component: PlanetAvatarComponent;
  let fixture: ComponentFixture<PlanetAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
