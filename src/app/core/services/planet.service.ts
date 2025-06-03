import { Injectable, signal } from "@angular/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase.client";
import { Planet } from "../interfaces/interfaces.models";

@Injectable({ providedIn: 'root' })
export class PlanetService {
  private readonly supabase: SupabaseClient = supabase;

  readonly planets = signal<Planet[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.refresh();
  }

  getAll(): Planet[] {
    return this.planets();
  }

  async refresh() {
    this.loading.set(true);
    const { data, error } = await this.supabase
      .from('planets')
      .select('id, name, image_url, order')
      .order('order', { ascending: true });

    if (error) {
      console.error('[PlanetService] Erreur chargement planètes :', error.message);
    } else {
      this.planets.set(data || []);
    }

    this.loading.set(false);
  }
}
