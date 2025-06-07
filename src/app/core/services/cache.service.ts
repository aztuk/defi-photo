// core/services/cache.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheService {
  restore<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[CacheService] Erreur restauration cache "${key}"`);
      return null;
    }
  }

  save<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.warn(`[CacheService] Erreur sauvegarde cache "${key}"`);
    }
  }

  hasChanged<T>(oldData: T, newData: T): boolean {
    return JSON.stringify(oldData) !== JSON.stringify(newData);
  }
}
