import { Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.client';
import { Photo } from '../interfaces/interfaces.models';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly supabase: SupabaseClient = supabase;

  // Cache local
  readonly photos = signal<Photo[]>([]);
  readonly loading = signal(false);

  // Drapeau de revalidation
  private lastFetched: number = 0;
  private readonly TTL = 1000 * 60 * 2; // 2 minutes

  constructor() {
    this.revalidate();
  }

  getAll(): Photo[] {
    return this.photos();
  }

  async revalidate(force = false, order: 'asc' | 'desc' = 'desc') {
    const now = Date.now();
    if (!force && now - this.lastFetched < this.TTL && this.photos().length > 0) {
      return;
    }

    this.loading.set(true);
    const { data, error } = await this.supabase
      .from('photos')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: order === 'asc' });

    if (error) {
      console.error('[PhotoService] Erreur chargement photos :', error.message);
    } else {
      this.photos.set(data || []);
      this.lastFetched = Date.now();
    }

    this.loading.set(false);
  }


  getByMissionAndPlanet(missionId: string, planetId: string): Photo[] {
    return this.photos().filter(p => p.mission_id === missionId && p.planet_id === planetId);
  }

  async upload(file: File, missionId: string, planetId: string, userName: string) {
    const extension = file.name.split('.').pop();
    const path = `${planetId}/${missionId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await this.supabase
      .storage
      .from('photos')
      .upload(path, file);

    if (uploadError) {
      console.error('[PhotoService] Erreur upload fichier:', uploadError.message);
      throw uploadError;
    }

    const { publicUrl } = this.supabase
      .storage
      .from('photos')
      .getPublicUrl(path).data;

    const { error: insertError } = await this.supabase.from('photos').insert({
      mission_id: missionId,
      planet_id: planetId,
      user_name: userName,
      url: publicUrl,
      status: 'published',
    });

    if (insertError) {
      console.error('[PhotoService] Erreur insertion table photos:', insertError.message);
      throw insertError;
    }

    // ✅ Met à jour la mission comme validée dans planet_missions
    await this.supabase
      .from('planet_missions')
      .update({ validated: true })
      .match({ mission_id: missionId, planet_id: planetId });

    await this.revalidate(true);
  }



}
