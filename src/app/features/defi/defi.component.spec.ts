import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefiComponent } from './defi.component';

describe('DefiComponent', () => {
  let component: DefiComponent;
  let fixture: ComponentFixture<DefiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
