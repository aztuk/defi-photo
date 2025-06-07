import { SupabaseClient } from '@supabase/supabase-js';
import { Mission, MissionProgress } from '../interfaces/interfaces.models';
import { Injectable, signal } from '@angular/core';
import { supabase } from './supabase.client';
import { CacheService } from './cache.service';

const CACHE_MISSIONS = 'cache_missions';
const CACHE_LINKS = 'cache_links';

@Injectable({ providedIn: 'root' })
export class MissionService {
  private readonly supabase: SupabaseClient = supabase;

  readonly missions = signal<Mission[]>([]);
  readonly planetMissions = signal<{ mission_id: string; planet_id: string }[]>([]);

  constructor(private cache: CacheService) {
    const cachedMissions = this.cache.restore<Mission[]>(CACHE_MISSIONS);
    const cachedLinks = this.cache.restore<{ mission_id: string; planet_id: string }[]>(CACHE_LINKS);

    if (cachedMissions) this.missions.set(cachedMissions);
    if (cachedLinks) this.planetMissions.set(cachedLinks);

    this.revalidate();
  }

  async revalidate() {
    await this.loadMissions();
    await this.loadLinks();
  }

  async loadMissions() {
    const { data, error } = await this.supabase.from('missions').select('*');
    if (!error && data && this.cache.hasChanged(this.missions(), data)) {
      this.missions.set(data);
      this.cache.save(CACHE_MISSIONS, data);
    }
  }

  async loadLinks() {
    const { data, error } = await this.supabase.from('planet_missions').select('*');
    if (!error && data && this.cache.hasChanged(this.planetMissions(), data)) {
      this.planetMissions.set(data);
      this.cache.save(CACHE_LINKS, data);
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
    if (!error) await this.loadLinks();
  }

  async unlinkFromPlanet(missionId: string, planetId: string) {
    await this.supabase.from('planet_missions').delete().match({ mission_id: missionId, planet_id: planetId });
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
   * Retourne une map de planet_id → liste des missions avec le nombre de photos publiées
   */
  async getAllMissionProgress(): Promise<Map<string, MissionProgress[]>> {
    console.time('[MissionService] getAllMissionProgress');

    const links = this.planetMissions();
    const missionIds = [...new Set(links.map(link => link.mission_id))];
    const missions = this.missions();

    // 1. Récupérer le nombre de photos publiées par mission ET par planète
    const { data: photoCounts, error } = await this.supabase
      .from('photos')
      .select('planet_id, mission_id, count:mission_id', { count: 'exact', head: false })
      .eq('status', 'published')
      .in('mission_id', missionIds);

    if (error) {
      console.error('[MissionService] Erreur chargement counts groupés :', error.message);
      return new Map();
    }

    // 2. Organisation des counts dans une Map<planet_id+mission_id, count>
    const countMap = new Map<string, number>();
    for (const row of photoCounts || []) {
      const key = `${row.planet_id}::${row.mission_id}`;
      countMap.set(key, row.count);
    }

    // 3. Regroupement par planète
    const result = new Map<string, MissionProgress[]>();
    for (const link of links) {
      const key = `${link.planet_id}::${link.mission_id}`;
      const mission = missions.find(m => m.id === link.mission_id);
      if (!mission) continue;

      const count = countMap.get(key) ?? 0;
      const entry: MissionProgress = {
        ...mission,
        photos_published: count,
        validated: count > 0,
      };

      if (!result.has(link.planet_id)) {
        result.set(link.planet_id, []);
      }

      result.get(link.planet_id)!.push(entry);
    }

    console.timeEnd('[MissionService] getAllMissionProgress');
    return result;
  }



}
