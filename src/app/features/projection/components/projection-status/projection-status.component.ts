import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectionService } from '../../services/projection.service';

@Component({
  selector: 'app-projection-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projection-status.component.html',
  styleUrls: ['./projection-status.component.scss']
})
export class ProjectionStatusComponent {
  private projectionService = inject(ProjectionService);
  isConnected = this.projectionService.isConnected;
}
