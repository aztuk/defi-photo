import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionFormComponent } from './mission-form/mission-form.component';
import { MissionByPlanetComponent } from "./mission-by-planet/mission-by-planet.component";
import { environment } from '../../../environments/environments';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, MissionFormComponent, MissionByPlanetComponent,FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
  readonly showPanel = signal(false);
  readonly isAuthenticated = signal<boolean>(
    localStorage.getItem('admin-auth') === 'ok'
  );
  passwordInput = '';
  error = '';

  constructor() {
      this.isAuthenticated.set(false);
  }

  checkPassword() {
    if (this.passwordInput === environment.adminPassword) {
      localStorage.setItem('admin-auth', 'ok');
      this.isAuthenticated.set(true);
    } else {
      this.error = 'Mot de passe incorrect.';
      this.passwordInput = '';
    }
  }

}
