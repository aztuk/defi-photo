// features/defi/defi.component.ts
import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { MissionService } from '../../core/services/mission.service';
import { NotificationService } from '../../core/services/notification.service';
import { PlanetContextService } from '../../core/context/planet-context.service';
import { Photo } from '../../core/interfaces/interfaces.models';
import { PhotoGalleryComponent } from '../../components/photo-gallery/photo-gallery.component';
import { PhotoViewerComponent } from '../../components/photo-viewer/photo-viewer.component';
import { PlanetService } from '../../core/services/planet.service';
import { UserContextService } from '../../core/context/user-context.service';
import { ScrollHeaderComponent } from "../../components/scroll-header/scroll-header.component";
import { DebugAuditService } from '../../core/services/debug-audit.service';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-defi',
  standalone: true,
  imports: [CommonModule, PhotoGalleryComponent, PhotoViewerComponent, PhotoUploadComponent],
  templateUrl: './defi.component.html',
  styleUrls: ['./defi.component.scss']
})
export class DefiComponent implements OnInit {
  missionId = '';
  photos = computed(() => {
    const allPhotos = this.photoService.photos();
    const planet = this.planetContext.currentPlanet();
    if (!planet) return [];
    return allPhotos.filter(p => p.mission_id === this.missionId && p.planet_id === planet.id);
  });
  selected = signal<Photo | null>(null);
  photoCount = signal(0);
  missionName = '';
  missionDescription = '';
  validated = false;
  missionPoints = 0;
  planetId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
    private missionService: MissionService,
    public planetContext: PlanetContextService,
    private planetService: PlanetService,
    private userContext: UserContextService,
    private notificationService: NotificationService
  ) {
    effect(() => {
      const temporaryPhotos = this.photoService.temporaryPhotos();
      const completedUpload = temporaryPhotos.find(p => p.status === 'success' && p.missionId === this.missionId);
      if (completedUpload) {
        this.refreshMissionStatus();
        this.photoService.clearTemporaryPhoto(completedUpload.id);
      }
    });
  }


goBack() {
  const planet = this.planetContext.currentPlanet();
  if (planet) {
    this.router.navigate(['/planet', planet.id]);
  }
}


getSelectedIndex(): number {
  const current = this.selected();
  return current ? this.photos().findIndex(p => p.id === current.id) : 0;
}

  async ngOnInit() {
  this.missionId = this.route.snapshot.paramMap.get('id')!;

  const planet = this.planetContext.currentPlanet();
  if (!planet) return;

  await this.photoService.revalidate(true);

  const allProgress = await this.missionService.getAllMissionProgress();
  const list = allProgress.get(planet.id) || [];
  const mission = list.find(m => m.id === this.missionId);
  if (mission) {
    this.missionName = mission.name;
    this.missionDescription = mission.description;
    this.validated = mission.validated;
    this.missionPoints = mission.points;
  }
}


  open(photo: Photo) {
    this.selected.set(photo);
  }

  close() {
    this.selected.set(null);
  }

  async onDelete(photo: Photo) {
    const confirmed = confirm('Supprimer cette photo ?');
    if (!confirmed) return;

    const success = await this.photoService.deletePhoto(photo, this.userContext.userName());
    if (success) {
      await this.refreshMissionStatus();
    }
    this.selected.set(null);
  }

  canEdit(photo: Photo): boolean {
    const isOwner = photo.user_name === this.userContext.userName();
    const isPlanetOwner = !this.planetContext.readonly();
    return isOwner && isPlanetOwner;
  }


  private async refreshMissionStatus() {
    await this.missionService.revalidate();
    const planet = this.planetContext.currentPlanet();
    if (!planet) return;

    const allProgress = await this.missionService.getAllMissionProgress();
    const list = allProgress.get(planet.id) || [];
    const mission = list.find(m => m.id === this.missionId);
    if (mission) {
      const wasValidated = this.validated;
      this.validated = mission.validated;
      this.missionPoints = mission.points;
      if (this.validated && !wasValidated) {
        this.notificationService.show(`Mission Accomplie ! Vous gagnez ${this.missionPoints} points.`);
      }
    }
  }

  onCountChange(count: number) {
    this.photoCount.set(count);
  }
}
