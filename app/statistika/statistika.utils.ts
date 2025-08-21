
import { HistoricalIncident, ChartDataPoint } from './statistika.types';

/**
 * Generates chart data from historical incidents, aggregating incidents by date.
 * @param incidents An array of HistoricalIncident objects.
 * @returns An array of ChartDataPoint objects.
 */
export const generateChartData = (incidents: HistoricalIncident[]): ChartDataPoint[] => {
  const incidentCounts: { [date: string]: number } = {};

  incidents.forEach(incident => {
    // Assuming incident.date is a string in 'YYYY-MM-DD' format or similar
    const dateKey = new Date(incident.date).toISOString().split('T')[0];
    incidentCounts[dateKey] = (incidentCounts[dateKey] || 0) + 1;
  });

  // Convert to array of ChartDataPoint and sort by date
  const chartData: ChartDataPoint[] = Object.keys(incidentCounts)
    .map(date => ({
      date: date,
      value: incidentCounts[date],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return chartData;
};
