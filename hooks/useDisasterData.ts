
import { useState, useCallback } from 'react';
import { fetchDisasterProneData, OverpassElement } from '@/lib/api';

export const useDisasterData = () => {
  const [disasterProneAreas, setDisasterProneAreas] = useState<OverpassElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisasterAreas = useCallback(async (bounds: { south: number; west: number; north: number; east: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDisasterProneData(bounds.south, bounds.west, bounds.north, bounds.east);
      setDisasterProneAreas(data.elements);
    } catch (err: any) {
      setError(err.message);
      setDisasterProneAreas([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { disasterProneAreas, isLoading, error, fetchDisasterAreas };
};
