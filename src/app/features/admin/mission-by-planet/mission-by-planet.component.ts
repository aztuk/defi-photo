import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetService } from '../../../core/services/planet.service';
import { MissionService } from '../../../core/services/mission.service';
import { Planet, Mission } from '../../../core/interfaces/interfaces.models';
import { MissionFormComponent } from '../mission-form/mission-form.component';
import { PlanetAvatarComponent } from '../../../components/planet-avatar/planet-avatar.component';

@Component({
  selector: 'app-mission-by-planet',
  standalone: true,
  imports: [CommonModule, MissionFormComponent, PlanetAvatarComponent],
  templateUrl: './mission-by-planet.component.html',
  styleUrls: ['./mission-by-planet.component.scss'],
})
export class MissionByPlanetComponent implements OnInit {
  readonly planets = signal<Planet[]>([]);
  readonly showForm = signal(false);
  readonly editingMission = signal<Mission | null>(null);

  constructor(
    private planetService: PlanetService,
    private missionService: MissionService
  ) {}

  async ngOnInit() {
      await Promise.all([
        this.planetService.revalidate(),
        this.missionService.revalidate(),
      ]);

    this.planets.set(this.planetService.getAll());
  }

  getTotalPoints(planet: Planet) {
    let total = 0;
    const missions = this.getMissionsForPlanet(planet.id)

    missions.forEach((m) => {
      total += m.points;
    })

    return total;
  }

  getMissionsForPlanet(planetId: string): Mission[] {
    const linkedMissionIds = this.missionService.planetMissions()
      .filter(link => link.planet_id === planetId)
      .map(link => link.mission_id);

    return this.missionService.missions().filter(m => linkedMissionIds.includes(m.id));
  }

  removeLink(missionId: string, planetId: string) {
    if (confirm('Supprimer cette mission pour cette planète ?')) {
      this.missionService.unlinkFromPlanet(missionId, planetId);
    }
  }

  deleteMission(missionId: string) {
    if (confirm('Supprimer complètement cette mission ?')) {
      this.missionService.deleteMission(missionId);
    }
  }

  editMission(mission: Mission | null) {
    this.editingMission.set(mission);
    this.showForm.set(true);
  }

  closeForm() {
    this.editingMission.set(null);
    this.showForm.set(false);
  }
}
