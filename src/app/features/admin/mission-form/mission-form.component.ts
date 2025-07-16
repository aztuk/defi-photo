import {
  Component, Input, Output, EventEmitter,
  OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Planet, Mission } from '../../../core/interfaces/interfaces.models';
import { MissionService } from '../../../core/services/mission.service';
import { PlanetService } from '../../../core/services/planet.service';

@Component({
  selector: 'app-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mission-form.component.html',
  styleUrls: ['./mission-form.component.scss'],
})
export class MissionFormComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) open = false;
  @Input() mission: Mission | null = null;
  @Output() close = new EventEmitter<void>();

  name = '';
  description = '';
  points = 0;
  selectedPlanets = new Set<string>();
  planets: Planet[] = [];

  constructor(
    public planetService: PlanetService,
    private missionService: MissionService
  ) {
    window.addEventListener('keydown', this.onKeydown);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['open'] && this.open) {
      await Promise.all([
        this.planetService.revalidate(),
        this.missionService.revalidate(),
      ]);
      this.planets = this.planetService.getAll();

      if (this.mission) {
        this.name = this.mission.name;
        this.description = this.mission.description;
        this.points = this.mission.points;
        const links = this.missionService.planetMissions()
          .filter(link => link.mission_id === this.mission!.id);
        this.selectedPlanets = new Set(links.map(l => l.planet_id));
      } else {
        this.reset();
      }
    }
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.onKeydown);
  }

  onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close.emit();
  };

  togglePlanet(id: string) {
    this.selectedPlanets.has(id)
      ? this.selectedPlanets.delete(id)
      : this.selectedPlanets.add(id);
  }

  async submit() {
    const name = this.name.trim();
    const description = this.description.trim();

    if (!name || !description) {
      alert('Nom et description requis');
      return;
    }

    let missionId: string;

    if (this.mission) {
      await this.missionService.updateMission(this.mission.id, { name, description, points: this.points });
      await this.missionService.unlinkAllPlanets(this.mission.id);
      missionId = this.mission.id;
    } else {
      missionId = await this.missionService.create({ name, description, points: this.points });
    }

    for (const planetId of this.selectedPlanets) {
      await this.missionService.linkToPlanet(missionId, planetId);
    }

    await this.missionService.revalidate();
    alert(this.mission ? 'Mission mise à jour' : 'Mission ajoutée');
    this.close.emit();
    this.reset();
  }

  private reset() {
    this.name = '';
    this.description = '';
    this.selectedPlanets.clear();
  }
}
