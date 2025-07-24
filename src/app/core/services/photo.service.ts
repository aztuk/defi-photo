import { Injectable, signal, effect, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.client';
import { Photo } from '../interfaces/interfaces.models';
import { NotificationService } from './notification.service';
import { UserContextService } from '../context/user-context.service';

export interface UploadPreview {
  id: string;
  file: File;
  url: string;
  publicUrl?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  missionId: string | null;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly supabase: SupabaseClient = supabase;

  // Cache local
  readonly photos = signal<Photo[]>([]);
  readonly temporaryPhotos = signal<UploadPreview[]>([]);
  readonly loading = signal(false);

  // Drapeau de revalidation
  private lastFetched: number = 0;
  private readonly TTL = 1000 * 60 * 2; // 2 minutes

  constructor(private notificationService: NotificationService, private userContext: UserContextService) {
    this.revalidate();

    effect(() => {
      if (this.userContext.isLoggedIn()) {
        this.revalidate(true);
      }
    });
  }

  getAll(forUserName?: string): Photo[] {
    if (forUserName) {
      return this.photos().filter(p => p.user_name === forUserName);
    }
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
      .order('created_at', { ascending: order === 'desc' });

    if (error) {
      console.error('[PhotoService] Erreur chargement photos :', error.message);
    } else {
      const sortedData = (data || []).sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateB !== dateA) {
          return dateB - dateA;
        }
        // Fallback sort by id (approximates creation order)
        return b.id.localeCompare(a.id);
      });
      this.photos.set(sortedData);
      this.lastFetched = Date.now();
    }

    this.loading.set(false);
  }


  getByMissionAndPlanet(missionId: string, planetId: string): Photo[] {
    return this.photos().filter(p => p.mission_id === missionId && p.planet_id === planetId);
  }

  async upload(file: File, missionId: string | null, planetId: string | null, userName: string) {
    const extension = file.name.split('.').pop();
    const path = `${planetId || 'gallery'}/${missionId || 'user-photos'}/${Date.now()}.${extension}`;

    // This method is kept for compatibility, but new uploads should use uploadWithProgress
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

    if (missionId && planetId) {
      await this.supabase
        .from('planet_missions')
        .update({ validated: true })
        .match({ mission_id: missionId, planet_id: planetId });
    }

    await this.revalidate(true);
    // The generic notification is removed to be replaced by the progress toast
    // this.notificationService.show('Photo uploadée avec succès !');
  }

  uploadWithProgress(
    file: File,
    missionId: string | null,
    planetId: string | null,
    userName: string
  ) {
    const id = Math.random().toString(36).substring(2);
    const url = URL.createObjectURL(file);
    const newPreview: UploadPreview = { id, file, url, progress: 0, status: 'uploading', missionId };

    this.temporaryPhotos.update(current => [newPreview, ...current]);

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.temporaryPhotos.update(current =>
        current.map(p => p.id === id ? { ...p, status: 'error', error: 'Fichier trop volumineux (max 10MB)' } : p)
      );
      return;
    }

    const updatePreview = (progress: number, status: 'uploading' | 'success' | 'error', error?: string) => {
      this.temporaryPhotos.update(current =>
        current.map(p => p.id === id ? { ...p, progress, status, error } : p)
      );
    };

    const doUpload = async (): Promise<void> => {
      const extension = file.name.split('.').pop();
      const path = `${planetId || 'gallery'}/${missionId || 'user-photos'}/${Date.now()}.${extension}`;

      updatePreview(10, 'uploading'); // Start with a bit of progress

      const { error: uploadError } = await this.supabase.storage
        .from('photos')
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error(`[PhotoService] [${id}] Upload error:`, uploadError);
        updatePreview(0, 'error', `Échec de l'upload: ${uploadError.message}`);
        return;
      }

      updatePreview(99, 'uploading'); // Almost done

      const { data: { publicUrl } } = this.supabase.storage.from('photos').getPublicUrl(path);

      const { data: newPhoto, error: insertError } = await this.supabase.from('photos').insert({
        mission_id: missionId,
        planet_id: planetId,
        user_name: userName,
        url: publicUrl,
        status: 'published',
      }).select().single();

      if (insertError || !newPhoto) {
        console.error(`[PhotoService] [${id}] DB insert error:`, insertError);
        updatePreview(0, 'error', 'Erreur de base de données.');
        return;
      }

      if (missionId && planetId) {
        await this.supabase
          .from('planet_missions')
          .update({ validated: true })
          .match({ mission_id: missionId, planet_id: planetId });
      }

      this.photos.update(currentPhotos => [newPhoto as Photo, ...currentPhotos]);
      this.temporaryPhotos.update(current =>
        current.map(p => p.id === id ? { ...p, progress: 100, status: 'success', publicUrl } : p)
      );
    };

    doUpload();
  }

  async deletePhoto(photo: Photo, currentUserName: string | null): Promise<boolean> {
    if (photo.user_name !== currentUserName) {
      console.warn('[PhotoService] Tentative de suppression non autorisée.');
      return false;
    }

    // 🗑 Supprimer la photo
    const { error: deleteError } = await this.supabase
      .from('photos')
      .delete()
      .eq('id', photo.id);

    if (deleteError) {
      console.warn('[PhotoService] Erreur suppression photo :', deleteError.message);
      return false;
    }

    // 🔁 Revalider les photos après suppression
    await this.revalidate(true);

    if (photo.mission_id && photo.planet_id) {
      // 🔄 Vérifie s'il reste des photos published pour la même mission/planète
      const remaining = this.getByMissionAndPlanet(photo.mission_id, photo.planet_id).length;

      if (remaining === 0) {
        // 🔄 Met à jour planet_missions.validated = false
        const { error: updateError } = await this.supabase
          .from('planet_missions')
          .update({ validated: false })
          .match({ mission_id: photo.mission_id, planet_id: photo.planet_id });

        if (updateError) {
          console.warn('[PhotoService] Erreur update validated=false :', updateError.message);
        }
      }
    }

      this.notificationService.show('Photo supprimée avec succès !');
      return true;
    }

  clearTemporaryPhoto(id: string) {
    this.temporaryPhotos.update(current => current.filter(p => p.id !== id));
  }
}
