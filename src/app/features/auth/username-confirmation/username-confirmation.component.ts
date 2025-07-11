import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';

@Component({
  selector: 'app-username-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './username-confirmation.component.html',
  styleUrls: ['./username-confirmation.component.scss']
})
export class UsernameConfirmationComponent {
  private router = inject(Router);
  private user = inject(UserContextService);

  userName = this.user.userName();

  onYes() {
    const name = this.user.userName();
    const planet = this.user.planetName();

    if (!name || !planet) {
      // Should not happen, but as a safeguard
      this.user.logout();
      this.router.navigate(['/login']);
      return;
    }

    // Finalize login with existing name and current (potentially new) planet
    this.user.login(name, planet);
    this.router.navigate(['/auth/welcome']);
  }

  onNo() {
    this.router.navigate(['/auth/username-input']);
  }
}
