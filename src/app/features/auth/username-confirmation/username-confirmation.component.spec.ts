import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernameConfirmationComponent } from './username-confirmation.component';

describe('UsernameConfirmationComponent', () => {
  let component: UsernameConfirmationComponent;
  let fixture: ComponentFixture<UsernameConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsernameConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsernameConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
