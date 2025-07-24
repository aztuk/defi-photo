import { Injectable, signal, computed, effect, OnDestroy, WritableSignal } from '@angular/core';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../core/services/supabase.client';
import { Photo, Planet, ClassementPlanet } from '../../../core/interfaces/interfaces.models';

@Injectable({
  providedIn: 'root'
})
export class ProjectionService implements OnDestroy {
  private readonly supabase: SupabaseClient = supabase;
  private realtimeChannel: RealtimeChannel | null = null;
  private pollingInterval: number | null = null;

  // Service state
  readonly photos: WritableSignal<Photo[]> = signal([]);
  readonly classement: WritableSignal<ClassementPlanet[]> = signal([]);
  readonly totalPhotos = computed(() => this.photos().length);
  readonly isConnected = signal(navigator.onLine);
  readonly isRealtimeConnected = signal(false);

  constructor() {
    this.initialize();
    this.setupOnlineStatusListener();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.clearOnlineStatusListener();
  }

  private async initialize(): Promise<void> {
    await this.refresh();
    this.setupRealtime();
  }

  async refresh(): Promise<void> {
    try {
      const [photosData, classementData] = await Promise.all([
        this.fetchPhotos(),
        this.fetchClassement()
      ]);
      this.photos.set(photosData);
      this.classement.set(classementData);
      this.isConnected.set(true);
    } catch (error) {
      console.error('[ProjectionService] Full refresh failed:', error);
      this.isConnected.set(false);
    }
  }

  private setupRealtime(): void {
    if (this.realtimeChannel) {
      return;
    }

    this.realtimeChannel = this.supabase
      .channel('photos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' },
        (payload) => this.handleRealtimeUpdate(payload)
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          this.isRealtimeConnected.set(true);
          this.stopPolling();
          this.refresh(); // Refresh on successful connection
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          this.isRealtimeConnected.set(false);
          this.startPolling();
          if (err) {
            console.error('[ProjectionService] Realtime error:', err);
          }
        }
      });
  }

  private handleRealtimeUpdate(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        this.photos.update(currentPhotos => [newRecord as Photo, ...currentPhotos]);
        break;
      case 'UPDATE':
        this.photos.update(currentPhotos =>
          currentPhotos.map(p => p.id === newRecord.id ? { ...p, ...newRecord } : p)
        );
        break;
      case 'DELETE':
        this.photos.update(currentPhotos =>
          currentPhotos.filter(p => p.id !== oldRecord.id)
        );
        break;
    }
    // Recalculate classement after any change
    this.refreshClassement();
  }

  private startPolling(): void {
    if (this.pollingInterval) {
      return;
    }
    this.pollingInterval = window.setInterval(() => this.refresh(), 30000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async fetchPhotos(): Promise<Photo[]> {
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`[ProjectionService] Fetch photos error: ${error.message}`);
    }
    return data || [];
  }

  private async fetchClassement(): Promise<ClassementPlanet[]> {
    const { data, error } = await this.supabase.rpc('get_planet_ranking');
    if (error) {
      throw new Error(`[ProjectionService] Fetch classement error: ${error.message}`);
    }
    return (data as any[]).map(item => ({
      id: item.planet_id,
      name: item.planet_name,
      score: item.total_points,
      photoCount: item.photo_count,
      image_url: `assets/planets/downscaled/${item.planet_name.toLowerCase()}`,
      order: 0
    }));
  }

  private async refreshClassement(): Promise<void> {
    try {
      const classementData = await this.fetchClassement();
      this.classement.set(classementData);
    } catch (error) {
      console.error('[ProjectionService] Refresh classement failed:', error);
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
    this.refresh();
    this.setupRealtime();
  }

  private handleOffline = () => {
    this.isConnected.set(false);
    this.isRealtimeConnected.set(false);
    this.disconnect();
  }

  disconnect(): void {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.stopPolling();
  }
}
