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
    // no-op
  }
}
