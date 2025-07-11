import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAccessComponent } from './test-access.component';

describe('TestAccessComponent', () => {
  let component: TestAccessComponent;
  let fixture: ComponentFixture<TestAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
