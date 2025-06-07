import { Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.client';
import { Planet } from '../interfaces/interfaces.models';
import { CacheService } from './cache.service';

const CACHE_KEY = 'cache_planets';

@Injectable({ providedIn: 'root' })
export class PlanetService {
  private readonly supabase: SupabaseClient = supabase;

  readonly planets = signal<Planet[]>([]);
  readonly loading = signal(false);

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

    const { data, error } = await this.supabase
      .from('planets')
      .select('id, name, image_url, order')
      .order('order', { ascending: true });

    if (!error && data && this.cache.hasChanged(this.planets(), data)) {
      this.planets.set(data);
      this.cache.save(CACHE_KEY, data);
    }

    this.loading.set(false);
  }
}
