import { Injectable, signal, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.client';
import { Planet } from '../interfaces/interfaces.models';
import { CacheService } from './cache.service';
import { RankingService } from './ranking.service';

const CACHE_KEY = 'cache_planets';

@Injectable({ providedIn: 'root' })
export class PlanetService {
  private readonly supabase: SupabaseClient = supabase;

  readonly planets = signal<Planet[]>([]);
  readonly loading = signal(false);

  private rankingService = inject(RankingService);

  constructor(private cache: CacheService) {
    const cached = this.cache.restore<Planet[]>(CACHE_KEY);
    if (cached) this.planets.set(cached);
    this.revalidate();
  }

  getAll(): Planet[] {
    return this.planets();
  }

  async revalidate() {
    this.loading.set(true);
    console.log('[PlanetService] Revalidating planets data');

    const { data, error } = await this.supabase
      .from('planets')
      .select('id, name, image_url, order, last_score_update')
      .order('order', { ascending: true });

    if (error) {
      console.error('[PlanetService] Error fetching planets:', error.message);
    } else {
      console.log('[PlanetService] Fetched planets data:', data);

      if (this.cache.hasChanged(this.planets(), data)) {
        console.log('[PlanetService] Planets data changed, updating cache');
        this.planets.set(data);
        this.cache.save(CACHE_KEY, data);
      } else {
        console.log('[PlanetService] Planets data unchanged');
      }
    }

    this.loading.set(false);
  }

  /**
   * Updates the last_score_update timestamp for a planet
   * @param planetId The ID of the planet to update
   * @returns A promise that resolves when the update is complete
   */
  async updateScoreTimestamp(planetId: string): Promise<void> {
    if (!planetId) {
      console.warn('[PlanetService] updateScoreTimestamp called with empty planetId');
      return;
    }

    console.log(`[PlanetService] Updating timestamp for planet ${planetId}`);

    try {
      // Get current timestamp in ISO format
      const timestamp = new Date().toISOString();
      console.log(`[PlanetService] Using timestamp: ${timestamp}`);

      // Perform the update
      const { data, error } = await this.supabase
        .from('planets')
        .update({ last_score_update: timestamp })
        .eq('id', planetId)
        .select();

      if (error) {
        console.error('[PlanetService] Error updating timestamp:', error.message);
      } else {
        console.log(`[PlanetService] Successfully updated timestamp for planet ${planetId}:`, data);

        // Verify the update by fetching the planet directly
        const { data: verifyData, error: verifyError } = await this.supabase
          .from('planets')
          .select('id, name, last_score_update')
          .eq('id', planetId)
          .single();

        if (verifyError) {
          console.error('[PlanetService] Error verifying timestamp update:', verifyError.message);
        } else {
          console.log(`[PlanetService] Verified timestamp for planet ${planetId}:`, verifyData);
        }

        // Force update the planets data without relying on cache comparison
        // This ensures the timestamp change is reflected in the UI
        this.planets.update(planets => {
          return planets.map(p => {
            if (p.id === planetId) {
              return { ...p, last_score_update: timestamp };
            }
            return p;
          });
        });

        // Also force a cache save to ensure the updated data is persisted
        this.cache.save(CACHE_KEY, this.planets());

        // Log the updated planets data
        console.log('[PlanetService] Updated planets data in memory:', this.planets());

        // Force refresh the ranking data
        console.log('[PlanetService] Forcing ranking refresh');
        await this.rankingService.revalidate();
        console.log('[PlanetService] Ranking refresh complete');
      }
    } catch (err) {
      console.error('[PlanetService] Exception updating timestamp:', err);
    }
  }

  /**
   * Updates the last_score_update timestamp for all planets
   * This is useful for testing and initialization
   */
  async updateAllPlanetTimestamps(): Promise<void> {
    console.log('[PlanetService] Updating timestamps for all planets');

    try {
      // Get all planets
      const { data, error: fetchError } = await this.supabase
        .from('planets')
        .select('id, name');

      if (fetchError) {
        console.error('[PlanetService] Error fetching planets:', fetchError.message);
        return;
      }

      const planets = data || [];
      console.log(`[PlanetService] Found ${planets.length} planets to update`);

      // Update each planet with a slightly different timestamp
      for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];

        // Create timestamps with 1-second intervals to ensure they're different
        const timestamp = new Date();
        timestamp.setSeconds(timestamp.getSeconds() - i);
        const timestampStr = timestamp.toISOString();

        console.log(`[PlanetService] Updating planet ${planet.name} with timestamp ${timestampStr}`);

        const { error: updateError } = await this.supabase
          .from('planets')
          .update({ last_score_update: timestampStr })
          .eq('id', planet.id);

        if (updateError) {
          console.error(`[PlanetService] Error updating timestamp for planet ${planet.name}:`, updateError.message);
        }
      }

      // Create a map of planet IDs to timestamps for quick lookup
      const timestampMap = new Map<string, string>();
      for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        const timestamp = new Date();
        timestamp.setSeconds(timestamp.getSeconds() - i);
        const timestampStr = timestamp.toISOString();
        timestampMap.set(planet.id, timestampStr);
      }

      // Force update the planets data without relying on cache comparison
      this.planets.update(planets => {
        return planets.map(p => {
          const newTimestamp = timestampMap.get(p.id);
          if (newTimestamp) {
            return { ...p, last_score_update: newTimestamp };
          }
          return p;
        });
      });

      // Also force a cache save to ensure the updated data is persisted
      this.cache.save(CACHE_KEY, this.planets());

      // Log the updated planets data
      console.log('[PlanetService] Updated all planets data in memory:', this.planets());

      // Force refresh the ranking data
      console.log('[PlanetService] Forcing ranking refresh for all planets');
      await this.rankingService.revalidate();
      console.log('[PlanetService] Ranking refresh complete for all planets');

      console.log('[PlanetService] Finished updating all planet timestamps');
    } catch (err) {
      console.error('[PlanetService] Exception updating all timestamps:', err);
    }
  }
}
