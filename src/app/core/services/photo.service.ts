import { Injectable, signal, effect, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environments';
import { supabase } from './supabase.client';
import { Photo } from '../interfaces/interfaces.models';
import { NotificationService } from './notification.service';
import { UserContextService } from '../context/user-context.service';
import { PlanetService } from './planet.service';

export interface UploadPreview {
  id: string;
  file: File;
  url: string;
  publicUrl?: string;
  progress: number;
  status: 'queued' | 'uploading' | 'success' | 'error';
  missionId: string | null;
  error?: string;
}

interface UploadQueueItem {
  id: string;
  file: File;
  missionId: string | null;
  planetId: string | null;
  userName: string;
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

  private uploadQueue: UploadQueueItem[] = [];
  private isProcessingQueue = false;

  constructor(
    private notificationService: NotificationService,
    private userContext: UserContextService,
    private planetService: PlanetService
  ) {
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

  queueFilesForUpload(
    files: FileList,
    missionId: string | null,
    planetId: string | null,
    userName: string
  ) {
    const newPreviews: UploadPreview[] = [];
    const newQueueItems: UploadQueueItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).substring(2);
      const url = URL.createObjectURL(file);

      // Initial state is 'queued'
      newPreviews.push({ id, file, url, progress: 0, status: 'queued', missionId });
      newQueueItems.push({ id, file, missionId, planetId, userName });
    }

    this.temporaryPhotos.update(current => [...newPreviews, ...current]);
    this.uploadQueue.push(...newQueueItems);

    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.uploadQueue.length === 0) {
      this.isProcessingQueue = false;
      console.log('[PhotoService] Upload queue finished.');
      return;
    }

    this.isProcessingQueue = true;
    const itemToUpload = this.uploadQueue.shift();

    if (!itemToUpload) {
      // Safeguard against empty items, continue processing.
      this.processQueue();
      return;
    }

    console.log(`[PhotoService] [${itemToUpload.id}] Processing item from queue.`);

    try {
      await this._performUpload(itemToUpload);
    } catch (error) {
      console.error(`[PhotoService] [${itemToUpload.id}] A critical error occurred during upload processing:`, error);
      // Mark the current item as failed with a generic error
      this.temporaryPhotos.update(current =>
        current.map(p => p.id === itemToUpload.id ? { ...p, status: 'error', error: 'Erreur critique.' } : p)
      );
    } finally {
      // Always process the next item, ensuring the queue doesn't die.
      this.processQueue();
    }
  }

  private _performUpload(item: UploadQueueItem): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const { id, file, missionId, planetId, userName } = item;

      const updatePreview = (progress: number, status: 'queued' | 'uploading' | 'success' | 'error', error?: string, publicUrl?: string) => {
        this.temporaryPhotos.update(current =>
          current.map(p => p.id === id ? { ...p, progress, status, error, publicUrl } : p)
        );
      };

      updatePreview(0, 'uploading');

      // Detect media type from MIME type
      const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';

      // Adjust size limit for videos (100MB for videos, 10MB for photos)
      const maxSize = mediaType === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeText = mediaType === 'video' ? '100MB' : '10MB';
        updatePreview(0, 'error', `Fichier trop volumineux (max ${maxSizeText})`);
        return reject(new Error('File too large'));
      }

      // Validate file type
      const isValidImage = file.type.startsWith('image/');
      const isValidVideo = file.type.startsWith('video/') && file.type === 'video/mp4';
      if (!isValidImage && !isValidVideo) {
        updatePreview(0, 'error', 'Format non supporté. Utilisez des images ou des vidéos MP4.');
        return reject(new Error('Invalid file type'));
      }

      const extension = file.name.split('.').pop();
      const path = `${planetId || 'gallery'}/${missionId || 'user-photos'}/${Date.now()}.${extension}`;

      const url = `${environment.supabaseUrl}/storage/v1/object/photos/${path}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.setRequestHeader('Authorization', `Bearer ${environment.supabaseKey}`);
      xhr.setRequestHeader('x-upsert', 'true');
      xhr.setRequestHeader('Content-Type', file.type);


      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 99);
          console.log(`[PhotoService] [${id}] Upload progress: ${progress}%`);
          updatePreview(progress, 'uploading');
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`[PhotoService] [${id}] Upload complete. Status: ${xhr.status}`);
          const { data: { publicUrl } } = this.supabase.storage.from('photos').getPublicUrl(path);

          const { data: newPhoto, error: insertError } = await this.supabase.from('photos').insert({
            mission_id: missionId, planet_id: planetId, user_name: userName, url: publicUrl, status: 'published', media_type: mediaType,
          }).select().single();

          if (insertError || !newPhoto) {
            updatePreview(0, 'error', 'Erreur base de données.');
            return reject(insertError || new Error('DB insert failed'));
          }

          if (missionId && planetId) {
            console.log(`[PhotoService] Photo uploaded for planet ${planetId}, mission ${missionId}`);

            await this.supabase.from('planet_missions').update({ validated: true }).match({ mission_id: missionId, planet_id: planetId });

            // Update the planet's timestamp when a photo is successfully uploaded
            console.log(`[PhotoService] Calling updateScoreTimestamp for planet ${planetId}`);
            await this.planetService.updateScoreTimestamp(planetId);
            console.log(`[PhotoService] Finished updateScoreTimestamp for planet ${planetId}`);
          }

          this.photos.update(current => [newPhoto as Photo, ...current]);
          updatePreview(100, 'success', undefined, publicUrl);
          resolve();
        } else {
          console.error(`[PhotoService] [${id}] Upload failed with status: ${xhr.status}`, xhr.responseText);
          updatePreview(0, 'error', `Échec: ${xhr.statusText}`);
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        console.error(`[PhotoService] [${id}] Network error during upload.`);
        updatePreview(0, 'error', 'Erreur réseau.');
        reject(new Error('Network Error'));
      };

      xhr.send(file);
    });
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

        // Update the planet's timestamp when a photo is deleted
        console.log(`[PhotoService] Calling updateScoreTimestamp for planet ${photo.planet_id} after photo deletion`);
        await this.planetService.updateScoreTimestamp(photo.planet_id);
        console.log(`[PhotoService] Finished updateScoreTimestamp for planet ${photo.planet_id} after photo deletion`);
      }
    }

      this.notificationService.show('Photo supprimée avec succès !');
      return true;
    }

  clearTemporaryPhoto(id: string) {
    this.temporaryPhotos.update(current => current.filter(p => p.id !== id));
  }
}
