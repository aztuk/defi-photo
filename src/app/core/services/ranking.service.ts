import { Injectable, signal } from '@angular/core';
import { ClassementPlanet } from '../interfaces/interfaces.models';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private readonly _classement = signal<ClassementPlanet[]>([]);
  readonly classement = this._classement.asReadonly();

  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  constructor() {}

  /**
   * Récupère le classement des planètes depuis la base de données
   * @param forceRefresh Force le rafraîchissement des données même si elles sont en cache
   * @returns Une promesse qui se résout avec le classement des planètes
   */
  async getClassement(forceRefresh = false): Promise<ClassementPlanet[]> {
    const now = Date.now();

    // Utilise le cache si disponible et pas trop ancien
    if (!forceRefresh && this._classement().length > 0 && now - this.lastFetchTime < this.CACHE_DURATION) {
      return this._classement();
    }

    try {
      const { data, error } = await supabase.rpc('get_planet_ranking');

      if (error) {
        console.error('[RankingService] Fetch classement error:', error);
        throw error;
      }

      console.log('[RankingService] Raw ranking data:', data);

      const classement = (data as any[]).map(item => {
        const planet = {
          id: item.planet_id,
          name: item.planet_name,
          score: item.total_points,
          photoCount: item.photo_count,
          image_url: `assets/planets/downscaled/${item.planet_name.toLowerCase()}`,
          lastScoreUpdate: item.last_score_update,
          order: 0
        };

        console.log(`[RankingService] Mapped planet ${item.planet_name}:`, planet);
        return planet;
      });

      this._classement.set(classement);
      this.lastFetchTime = now;

      return classement;
    } catch (error) {
      console.error('[RankingService] Error fetching classement:', error);
      return this._classement();
    }
  }

  /**
   * Force le rafraîchissement des données de classement
   */
  async revalidate(): Promise<void> {
    await this.getClassement(true);
  }
}
