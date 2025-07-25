import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../core/context/user-context.service';
import { Router } from '@angular/router';
import { RankingComponent } from '../../components/ranking/ranking.component';
import { RankingService } from '../../core/services/ranking.service';
import { ClassementPlanet } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RankingComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly loading = signal(true);
  readonly classement = signal<ClassementPlanet[]>([]);

  readonly userPlanet = computed(() => this.userContext.planet());
  readonly userName = computed(() => this.userContext.userName());

  constructor(
    private userContext: UserContextService,
    private rankingService: RankingService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const classementData = await this.rankingService.getClassement();
      this.classement.set(classementData);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
