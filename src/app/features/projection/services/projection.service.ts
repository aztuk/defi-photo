import { Injectable, signal, computed, effect, OnDestroy, WritableSignal } from '@angular/core';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../core/services/supabase.client';
import { Photo, Planet, ClassementPlanet } from '../../../core/interfaces/interfaces.models';
import { RankingService } from '../../../core/services/ranking.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectionSyncService implements OnDestroy {
  private readonly supabase: SupabaseClient = supabase;
  private pollingInterval: number | null = null;

  // Service state
  readonly photos: WritableSignal<Photo[]> = signal([]);
  readonly classement: WritableSignal<ClassementPlanet[]> = signal([]);
  readonly totalPhotos = computed(() => this.photos().length);
  readonly isConnected = signal(navigator.onLine);

  constructor(private rankingService: RankingService) {
    this.setupOnlineStatusListener();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.clearOnlineStatusListener();
  }

  startPolling(): void {
    if (this.pollingInterval) {
      return;
    }
    // Initial fetch
    this.refreshData();
    // Start polling
    this.pollingInterval = window.setInterval(() => this.refreshData(), 10000);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async refreshData(): Promise<void> {
    try {
      const [photosData, classementData] = await Promise.all([
        this.fetchPhotos(),
        this.rankingService.getClassement(true),
      ]);
      this.photos.set(photosData);
      this.classement.set(classementData);
      this.isConnected.set(true);
    } catch (error) {
      console.error('[ProjectionSyncService] Refresh failed:', error);
      this.isConnected.set(false);
    }
  }

  private async fetchPhotos(): Promise<Photo[]> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`[ProjectionSyncService] Fetch photos error: ${error.message}`);
    }
    return data || [];
  }

  // La méthode fetchClassement est supprimée car elle est remplacée par rankingService.getClassement

  private async refreshClassement(): Promise<void> {
    try {
      const classementData = await this.rankingService.getClassement(true);
      this.classement.set(classementData);
    } catch (error) {
      console.error('[ProjectionSyncService] Refresh classement failed:', error);
    }
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private clearOnlineStatusListener(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isConnected.set(true);
    this.refreshData();
  }

  private handleOffline = () => {
    this.isConnected.set(false);
  }
}
