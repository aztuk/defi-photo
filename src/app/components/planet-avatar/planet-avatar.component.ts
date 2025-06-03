import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planet } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-planet-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planet-avatar.component.html',
  styleUrls: ['./planet-avatar.component.scss'],
})
export class PlanetAvatarComponent {
  @Input() planet!: Planet;
  @Input() selected = false;
  @Output() select = new EventEmitter<Planet>();

  onClick() {
    this.select.emit(this.planet);
  }
}
