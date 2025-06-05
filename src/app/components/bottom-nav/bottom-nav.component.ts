import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetAvatarComponent } from "../planet-avatar/planet-avatar.component";
import { Planet } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, PlanetAvatarComponent],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  private user = inject(UserContextService);
  public id = this.user.planet;
  public planet!: Planet;
  readonly planetLink = computed(() => {
    return this.id ? `/planet/${this.id}` : '/planet/unknown';
});

  ngOnInit(): void { }

}
