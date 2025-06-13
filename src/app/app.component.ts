import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserContextService } from './core/context/user-context.service';
import { BottomNavComponent } from "./components/bottom-nav/bottom-nav.component";
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {

  constructor(private _theme: ThemeService) {

  }

  ngOnInit(): void {

  }

}
