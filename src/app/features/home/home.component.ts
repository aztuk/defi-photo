import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../core/context/user-context.service';
import { Router } from '@angular/router';
import { RankingComponent } from '../../components/ranking/ranking.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RankingComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly loading = signal(true);

  readonly userPlanet = computed(() => this.userContext.planet());
  readonly userName = computed(() => this.userContext.userName());

  constructor(
    private userContext: UserContextService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loading.set(false);
  }
}
