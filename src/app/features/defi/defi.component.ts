// features/defi/defi.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoService } from '../../core/services/photo.service';
import { MissionService } from '../../core/services/mission.service';
import { PlanetContextService } from '../../core/context/planet-context.service';
import { Photo } from '../../core/interfaces/interfaces.models';
import { PhotoGalleryComponent } from '../../components/photo-gallery/photo-gallery.component';
import { PhotoViewerComponent } from '../../components/photo-viewer/photo-viewer.component';
import { PlanetService } from '../../core/services/planet.service';
import { UserContextService } from '../../core/context/user-context.service';
import { ScrollHeaderComponent } from "../../components/scroll-header/scroll-header.component";

@Component({
  selector: 'app-defi',
  standalone: true,
  imports: [CommonModule, PhotoGalleryComponent, PhotoViewerComponent, ScrollHeaderComponent],
  templateUrl: './defi.component.html',
  styleUrls: ['./defi.component.scss']
})
export class DefiComponent implements OnInit {
  missionId = '';
  photos = signal<Photo[]>([]);
  selected = signal<Photo | null>(null);
  missionName = '';
  missionDescription = '';
  validated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
    private missionService: MissionService,
    private planetContext: PlanetContextService,
    private planetService: PlanetService,
    private userContext: UserContextService
  ) {}

goBack() {
  const planet = this.planetContext.currentPlanet();
  if (planet) {
    this.router.navigate(['/planet', planet.id]);
  } else {
    this.router.navigate(['/home']); // fallback
  }
}

getSelectedIndex(): number {
  const current = this.selected();
  return current ? this.photos().findIndex(p => p.id === current.id) : 0;
}

  async ngOnInit() {
    this.missionId = this.route.snapshot.paramMap.get('id')!;
    await this.ensurePlanetContext();
    const planet = this.planetContext.currentPlanet();
    if (!planet) return;

    await this.photoService.revalidate();
    const photos = this.photoService.getByMissionAndPlanet(this.missionId, planet.id);
    this.photos.set(photos);

    const allProgress = await this.missionService.getAllMissionProgress();
    const list = allProgress.get(planet.id) || [];
    const mission = list.find(m => m.id === this.missionId);
    if (mission) {
      this.missionName = mission.name;
      this.missionDescription = mission.description;
      this.validated = mission.validated;
    }
  }

  async ensurePlanetContext() {
    await this.planetService.revalidate();
    this.userContext.initFromPlanetsList(this.planetService.getAll());

    const { data, error } = await this.missionService['supabase']
      .from('planet_missions')
      .select('planet_id')
      .eq('mission_id', this.missionId)
      .single();

    if (error || !data?.planet_id) {
      console.warn('[DefiComponent] Impossible de retrouver la planète associée à la mission.');
      return;
    }

    const planets = this.planetService.getAll();
    const userPlanet = this.userContext.planet();
    this.planetContext.initFromRoute(data.planet_id, planets, userPlanet);
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

    const success = await this.photoService.deletePhoto(photo.id);
    if (success) {
      const planet = this.planetContext.currentPlanet();
      if (!planet) return;
      const refreshed = this.photoService.getByMissionAndPlanet(this.missionId, planet.id);
      this.photos.set(refreshed);
    }
  }

  onDownload(photo: Photo) {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = 'photo.jpg';
    a.click();
  }

  get canEdit(): boolean {
    return !this.planetContext.readonly();
  }
}
