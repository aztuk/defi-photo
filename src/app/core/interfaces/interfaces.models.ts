
export interface Planet {
  id: string;
  name: string;
  image_url: string;
  order: number;
}

export interface PreFillData {
  name: string | null;
  planet: Planet | null;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
}

export interface PlanetWithMissionsProgress extends Planet {
  missionsProgress: MissionProgress[];
  missionsValidated: number;
  progressPercent: number;
}

export interface MissionProgress extends Mission {
  photos_published: number;
  validated: boolean;
}

export interface UserIdentity {
  name: string;
  planet: string;
}
