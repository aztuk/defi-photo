import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetAvatarComponent } from '../../../components/planet-avatar/planet-avatar.component';
import { Planet } from '../../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-planet-selector',
  standalone: true,
  imports: [CommonModule, PlanetAvatarComponent],
  templateUrl: './planet-selector.component.html',
  styleUrls: ['./planet-selector.component.scss'],
})
export class PlanetSelectorComponent {
  @Input({ required: true }) planets: Planet[] = [];
  @Output() select = new EventEmitter<Planet>();
  @Output() close = new EventEmitter<void>();

  onSelect(p: Planet) {
    this.select.emit(p);
    this.close.emit();
  }

  onClose() {
    this.close.emit();
  }
}
