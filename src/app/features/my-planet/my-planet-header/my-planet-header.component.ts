import {
  Component,
  Input,
  signal,
  computed,
  effect,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { MissionProgress } from '../../../core/interfaces/interfaces.models';
import { UserContextService } from '../../../core/context/user-context.service';
import { CommonModule } from '@angular/common';
import { PlanetAvatarComponent } from "../../../components/planet-avatar/planet-avatar.component";
import { ScrollHeaderComponent } from "../../../components/scroll-header/scroll-header.component";
import { ProgressComponent } from "../../../components/progress/progress.component";

@Component({
  selector: 'app-my-planet-header',
  templateUrl: './my-planet-header.component.html',
  styleUrl: './my-planet-header.component.scss',
  standalone: true,
  imports: [CommonModule, PlanetAvatarComponent, ScrollHeaderComponent, ProgressComponent]
})
export class MyPlanetHeaderComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) progress!: MissionProgress[];
  @Input({ required: true }) rank!: number;
  @Input({ required: true }) total!: number;

  readonly userName;
  readonly planet;

  readonly shrinkRatio = signal(1);

  private lastRatio = 1;
  private lastScroll = 0;
  private scrollListener?: () => void;

  constructor(private userService: UserContextService) {
    this.planet = this.userService.planet();
    this.userName = this.userService.userName();
  }
get completed(): number {
    return this.progress.filter(p => p.validated).length;
  }

  get percent(): number {
    return this.progress.length === 0 ? 0 : Math.round((this.completed / this.progress.length) * 100);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.updateShrinkRatio(); // première lecture exacte
    this.scrollListener = () => {
      this.updateShrinkRatio();
    };
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

    // 💡 Ne rien recalculer si le scroll n’a pas changé
    if (scrollTop === this.lastScroll) return;

    this.lastScroll = scrollTop;

    const ratio = +(1 - Math.min(scrollTop, maxScroll) / maxScroll).toFixed(2);

    // 💡 Ne pas mettre à jour si on est dans la même zone visuelle
    if (Math.abs(this.lastRatio - ratio) < 0.01) return;

    this.lastRatio = ratio;
    this.shrinkRatio.set(ratio);
  }
}
