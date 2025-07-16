import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserContextService } from '../../core/context/user-context.service';

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-info.component.html',
  styleUrls: ['./debug-info.component.scss']
})
export class DebugInfoComponent {
  user = inject(UserContextService);
}
