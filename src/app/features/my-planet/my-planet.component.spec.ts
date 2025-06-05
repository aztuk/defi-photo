import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPlanetComponent } from './my-planet.component';

describe('MyPlanetComponent', () => {
  let component: MyPlanetComponent;
  let fixture: ComponentFixture<MyPlanetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPlanetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPlanetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
