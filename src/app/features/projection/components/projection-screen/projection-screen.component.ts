import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingComponent } from '../../../../components/ranking/ranking.component';
import { ProjectionSyncService } from '../../services/projection.service';
import { ProjectionStatusComponent } from '../projection-status/projection-status.component';
import { FloatingGalleryComponent } from '../floating-gallery/floating-gallery.component';

@Component({
  selector: 'app-projection-screen',
  standalone: true,
  imports: [CommonModule, RankingComponent, ProjectionStatusComponent, FloatingGalleryComponent],
  templateUrl: './projection-screen.component.html',
  styleUrls: ['./projection-screen.component.scss']
})
export class ProjectionScreenComponent implements OnInit, OnDestroy {
  private projectionService = inject(ProjectionSyncService);

  photos = this.projectionService.photos;
  classement = this.projectionService.classement;
  totalPhotos = this.projectionService.totalPhotos;

  constructor() {}

  ngOnInit() {
    this.projectionService.startPolling();
  }

  ngOnDestroy() {
    this.projectionService.stopPolling();
  }
}
