import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetService } from '../../core/services/planet.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: '',
})
export class LoginComponent implements OnInit {
  private user = inject(UserContextService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private planetService = inject(PlanetService);

  async ngOnInit() {
    this.router.navigate(['/auth/welcome'], {
      queryParams: this.route.snapshot.queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
