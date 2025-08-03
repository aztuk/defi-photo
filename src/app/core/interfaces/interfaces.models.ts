
export interface Planet {
  id: string;
  name: string;
  image_url: string;
  order: number;
  last_score_update?: string;
}

export interface PreFillData {
  name: string | null;
  planet: Planet | null;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface PlanetWithMissionsProgress extends Planet {
  missionsProgress: MissionProgress[];
  missionsValidated: number;
  progressPercent: number;
  score: number;
}

export interface MissionProgress extends Mission {
  photos_published: number;
  validated: boolean;
}

export interface UserIdentity {
  name: string;
  planet: string;
}

export interface Photo {
  id: string;
  mission_id: string | null;
  planet_id: string | null;
  user_name: string;
  url: string;
  status: 'published' | 'pending' | 'rejected';
  created_at: string;
  media_type: 'photo' | 'video';
}


export interface SwipeCarouselItem {
  id: string;
  imageUrl: string;
  alt?: string;
  isAddButton?: boolean;
  deletable?: boolean;
}
export interface ClassementPlanet extends Planet {
  score: number;
  photoCount: number;
  lastScoreUpdate?: string; // ISO timestamp string
}
