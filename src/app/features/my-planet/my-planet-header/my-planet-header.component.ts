import {
  Component,
  signal,
  computed,
  effect,
  OnInit,
  AfterViewInit,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetAvatarComponent } from '../../../components/planet-avatar/planet-avatar.component';
import { MissionProgress } from '../../../core/interfaces/interfaces.models';
import { PlanetContextService } from '../../../core/context/planet-context.service';
import { UserContextService } from '../../../core/context/user-context.service';

@Component({
  selector: 'app-my-planet-header',
  templateUrl: './my-planet-header.component.html',
  styleUrl: './my-planet-header.component.scss',
  standalone: true,
  imports: [CommonModule, PlanetAvatarComponent]
})
export class MyPlanetHeaderComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) progress!: MissionProgress[];
  @Input({ required: true }) rank!: number;
  @Input({ required: true }) total!: number;
  @Input({ required: true }) score!: number;

  readonly planet = computed(() => this.context.currentPlanet() ?? undefined);
  readonly isReadonly;
  readonly userName;

  readonly shrinkRatio = signal(1);
  private lastRatio = 1;
  private lastScroll = 0;
  private scrollListener?: () => void;

  constructor(private context: PlanetContextService, private user: UserContextService) {
    this.isReadonly = this.context.readonly();
    this.userName = this.user.userName();
  }

  get completed(): number {
    return this.progress.filter(p => p.validated).length;
  }

  get percent(): number {
    return this.progress.length === 0 ? 0 : Math.round((this.completed / this.progress.length) * 100);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.updateShrinkRatio();
    this.scrollListener = () => this.updateShrinkRatio();
    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private updateShrinkRatio() {
    const maxScroll = 100;
    const scrollTop = window.scrollY;

    if (scrollTop === this.lastScroll) return;

    this.lastScroll = scrollTop;
    const ratio = +(1 - Math.min(scrollTop, maxScroll) / maxScroll).toFixed(2);

    if (Math.abs(this.lastRatio - ratio) < 0.01) return;

    this.lastRatio = ratio;
    this.shrinkRatio.set(ratio);
  }
}
