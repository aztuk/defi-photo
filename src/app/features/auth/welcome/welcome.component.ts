import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  private router = inject(Router);
  private user = inject(UserContextService);

  readonly userName = this.user.userName();
  readonly planetName = this.user.planetName();

  enter() {
    const planetId = this.user.planetId();
    if (!planetId) {
      console.error('[Welcome] Planet ID not found');
      return;
    }

    this.router.navigate(['/planet', planetId]);
  }
}
