import { create } from 'zustand';
import { SelectedLocation, MapBounds } from '@/app/state'; // Re-use types from app/state

interface AppState {
  selectedLocation: SelectedLocation | null;
  mapBounds: MapBounds | null;
  setSelectedLocation: (location: SelectedLocation | null) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedLocation: null,
  mapBounds: null,
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setMapBounds: (bounds) => set({ mapBounds: bounds }),
}));
