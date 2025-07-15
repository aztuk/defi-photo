import { inject, Injectable } from '@angular/core';
import { UserContextService } from '../context/user-context.service';
import { PlanetContextService } from '../context/planet-context.service';
import { PlanetService } from '../services/planet.service';
import { PhotoService } from '../services/photo.service';
import { MissionService } from '../services/mission.service';

@Injectable({ providedIn: 'root' })
export class DebugAuditService {
  private userContext = inject(UserContextService);
  private planetContext = inject(PlanetContextService);
  private planetService = inject(PlanetService);
  private photoService = inject(PhotoService);
  private missionService = inject(MissionService);

  logAll() {
    console.group('[🧩 DEBUG AUDIT]');

    console.group('🧍 UserContextService');
    console.log('isLoggedIn:', this.userContext.isLoggedIn());
    console.log('userName:', this.userContext.userName());
    console.log('userPlanet:', this.userContext.planet());
    console.groupEnd();

    console.group('🪐 PlanetContextService');
    console.log('currentPlanet:', this.planetContext.currentPlanet());
    console.log('readonly:', this.planetContext.readonly());
    console.groupEnd();

    console.group('📦 PlanetService');
    console.log('planets:', this.planetService.getAll());
    console.groupEnd();

    console.group('📷 PhotoService');
    console.log('photos (cache):', this.photoService.getAll());
    console.groupEnd();

    console.group('🧭 MissionService');
    console.log('missions:', this.missionService.missions());
    console.log('planetMissions (links):', this.missionService.planetMissions());
    console.groupEnd();

    console.groupEnd();
  }
}
