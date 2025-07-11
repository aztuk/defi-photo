import { Component, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-username-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './username-input.component.html',
  styleUrls: ['./username-input.component.scss']
})
export class UsernameInputComponent implements AfterViewInit {
  private router = inject(Router);
  private user = inject(UserContextService);

  name = '';
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    setTimeout(() => this.inputRef.nativeElement.focus(), 0);
  }

  onSubmit() {
    const planet = this.user.planetName();
    if (!planet) {
      alert('Erreur : planète manquante.');
      return;
    }

    this.user.login(this.name, planet);
    this.router.navigate(['/auth/welcome']);
  }

  isDisabled() {
    return this.name.length == 0;
  }
}
