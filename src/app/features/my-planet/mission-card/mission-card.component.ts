import { Component, Input } from '@angular/core';
import { MissionProgress } from '../../../core/interfaces/interfaces.models';
import { CommonModule, NgForOf } from '@angular/common';

@Component({
  selector: 'app-mission-card',
  imports: [CommonModule],
  templateUrl: './mission-card.component.html',
  styleUrl: './mission-card.component.scss'
})
export class MissionCardComponent {
  @Input({ required: true }) mission!: MissionProgress;
  @Input({ required: true }) nb!: number;

}
