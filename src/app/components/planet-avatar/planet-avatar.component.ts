import { Component, computed, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planet } from '../../core/interfaces/interfaces.models';
import { UserContextService } from '../../core/context/user-context.service';

@Component({
  selector: 'app-planet-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planet-avatar.component.html',
  styleUrls: ['./planet-avatar.component.scss'],
})
export class PlanetAvatarComponent {
  @Input({ required: false }) planet?: Planet;
loaded = false;

  private user = inject(UserContextService);
  readonly userPlanet = computed(() => {
    return this.planet || this.user.planet();
  });

  onLoad() {
    this.loaded = true;
  }
}
