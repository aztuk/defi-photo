import { Component, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';
import { FormsModule } from '@angular/forms';
import { DebugInfoComponent } from '../../../components/debug-info/debug-info.component';

@Component({
  selector: 'app-username-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './username-input.component.html',
  styleUrls: ['./username-input.component.scss']
})
export class UsernameInputComponent implements AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  user = inject(UserContextService);

  name = '';
  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    setTimeout(() => this.inputRef.nativeElement.focus(), 0);
  }

  onSubmit() {
    const planet = this.user.temporaryPlanetName() || this.user.planetName();
    if (!planet) {
      alert('Erreur : planète manquante.');
      return;
    }

    this.user.login(this.name, planet);

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || `/planet/${this.user.planetId()}`;
    this.router.navigateByUrl(returnUrl);
  }

  isDisabled() {
    return this.name.length == 0;
  }
}
