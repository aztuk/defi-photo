import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPlanetHeaderComponent } from './my-planet-header.component';

describe('MyPlanetHeaderComponent', () => {
  let component: MyPlanetHeaderComponent;
  let fixture: ComponentFixture<MyPlanetHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPlanetHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPlanetHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
