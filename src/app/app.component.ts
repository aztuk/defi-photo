import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserContextService } from './core/context/user-context.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html"
})
export class AppComponent {

  constructor(private userCtx: UserContextService) {}

  ngOnInit(): void {
  }

}
