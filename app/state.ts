import type { OverpassElement } from '@/lib/api';

export interface SelectedLocation {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
  name?: string; // Add optional name for favorite locations
}

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface AppState {
  selectedLocation: SelectedLocation | null;
  mapBounds: MapBounds | null;
}

export type AppAction =
  | { type: 'SET_LOCATION'; payload: SelectedLocation | null }
  | { type: 'SET_MAP_BOUNDS'; payload: MapBounds | null };

export const initialState: AppState = {
  selectedLocation: null,
  mapBounds: null,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, selectedLocation: action.payload };
    case 'SET_MAP_BOUNDS':
      return { ...state, mapBounds: action.payload };
    default:
      return state;
  }
}
