import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetAvatarComponent } from "../planet-avatar/planet-avatar.component";
import { Planet } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  private user = inject(UserContextService);
  public id = this.user.planet;
  public planet!: Planet;
  readonly planetLink = computed(() => {
  const planet = this.user.planet();
  return planet ? `/planet/${planet.name}` : '/planet/unknown';
  });


  ngOnInit(): void { }

}
