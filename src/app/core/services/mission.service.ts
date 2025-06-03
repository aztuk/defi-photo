import { SupabaseClient } from "@supabase/supabase-js";
import { Mission, MissionProgress } from "../interfaces/interfaces.models";
import { Injectable, signal } from "@angular/core";
import { supabase } from "./supabase.client";

@Injectable({ providedIn: 'root' })
export class MissionService {
  private readonly supabase: SupabaseClient = supabase;

  readonly missions = signal<Mission[]>([]);
  readonly planetMissions = signal<{ mission_id: string; planet_id: string }[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh() {
    this.loadMissions();
    this.loadLinks();
  }

  async loadMissions() {
    const { data, error } = await this.supabase.from('missions').select('*');
    if (error) {
      console.error('[MissionService] Erreur chargement missions :', error.message);
    } else {
      this.missions.set(data || []);
    }
  }

  async loadLinks() {
    const { data, error } = await this.supabase.from('planet_missions').select('*');
    if (error) {
      console.error('Erreur chargement planet_missions', error.message);
    } else {
      this.planetMissions.set(data || []);
    }
  }

  async addMission(newMission: Partial<Mission>) {
    const { error } = await this.supabase.from('missions').insert(newMission);
    if (!error) await this.loadMissions();
  }

  async deleteMission(id: string) {
    const { error } = await this.supabase.from('missions').delete().eq('id', id);
    if (!error) await this.loadMissions();
  }

  async create(payload: { name: string; description: string }): Promise<string> {
    const { data, error } = await this.supabase
      .from('missions')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error('[MissionService] Erreur création mission:', error.message);
      throw error;
    }

    return data.id;
  }

  async updateMission(id: string, payload: Partial<Mission>) {
    await this.supabase.from('missions').update(payload).eq('id', id);
    await this.loadMissions();
  }


  async linkToPlanet(missionId: string, planetId: string) {
    const { error } = await this.supabase.from('planet_missions').insert({
      mission_id: missionId,
      planet_id: planetId,
    });

    if (error) {
      console.error(`[MissionService] Erreur lien mission-planète:`, error.message);
    }
  }

  async unlinkFromPlanet(missionId: string, planetId: string) {
    await this.supabase
      .from('planet_missions')
      .delete()
      .match({ mission_id: missionId, planet_id: planetId });
    await this.loadLinks();
  }

  async unlinkAllPlanets(missionId: string) {
    await this.supabase.from('planet_missions').delete().eq('mission_id', missionId);
    await this.loadLinks();
  }

  isMissionLinkedToPlanet(missionId: string, planetId: string): boolean {
    return this.planetMissions().some(
      link => link.mission_id === missionId && link.planet_id === planetId
    );
  }

  /**
   * Récupère les missions liées à une planète avec le nombre de photos publiées
   */
  async getMissionProgressByPlanet(planetId: string): Promise<MissionProgress[]> {
    const links = this.planetMissions().filter(link => link.planet_id === planetId);

    const missionIds = links.map(link => link.mission_id);
    const missions = this.missions().filter(m => missionIds.includes(m.id));

    const results: MissionProgress[] = [];

    for (const mission of missions) {
      const { count, error } = await this.supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('planet_id', planetId)
        .eq('mission_id', mission.id)
        .eq('status', 'published');

      results.push({
        ...mission,
        photos_published: count || 0,
        validated: (count || 0) > 0,
      });
    }

    return results;
  }

}
