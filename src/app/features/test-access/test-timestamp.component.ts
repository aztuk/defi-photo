import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetService } from '../../core/services/planet.service';
import { RankingService } from '../../core/services/ranking.service';

@Component({
  selector: 'app-test-timestamp',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Test Timestamp Update</h1>

      <div class="actions">
        <button (click)="updateAllTimestamps()">Update All Planet Timestamps</button>
        <button (click)="refreshRanking()">Refresh Ranking</button>
      </div>

      <div class="results">
        <h2>Current Ranking</h2>
        <pre>{{ rankingJson }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }

    .actions {
      margin: 20px 0;
    }

    button {
      margin-right: 10px;
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }

    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      max-height: 500px;
    }
  `]
})
export class TestTimestampComponent {
  rankingJson = '';

  constructor(
    private planetService: PlanetService,
    private rankingService: RankingService
  ) {
    this.refreshRanking();
  }

  async updateAllTimestamps() {
    console.log('Updating all planet timestamps...');
    await this.planetService.updateAllPlanetTimestamps();
    await this.refreshRanking();
    console.log('All planet timestamps updated');
  }

  async refreshRanking() {
    console.log('Refreshing ranking...');
    const ranking = await this.rankingService.getClassement(true);
    this.rankingJson = JSON.stringify(ranking, null, 2);
    console.log('Ranking refreshed:', ranking);
  }
}
