
import { useState, useCallback } from 'react';
import { fetchPumpStatusData, PumpData } from '@/lib/api';

export const usePumpStatusData = () => {
  const [pumpStatusData, setPumpStatusData] = useState<PumpData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPumpStatus = useCallback(async (districtName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPumpStatusData(districtName);
      setPumpStatusData(data);
    } catch (err: any) {
      setError(err.message);
      setPumpStatusData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { pumpStatusData, isLoading, error, fetchPumpStatus };
};
