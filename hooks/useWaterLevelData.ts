
import { useState, useCallback } from 'react';
import { fetchWaterLevelData, WaterLevelPost } from '@/lib/api';

export const useWaterLevelData = () => {
  const [waterLevelPosts, setWaterLevelPosts] = useState<WaterLevelPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWaterLevels = useCallback(async (districtName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWaterLevelData(districtName);
      setWaterLevelPosts(data);
    } catch (err: any) {
      setError(err.message);
      setWaterLevelPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { waterLevelPosts, isLoading, error, fetchWaterLevels };
};
