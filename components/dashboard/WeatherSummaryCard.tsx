import { CloudSun, Sun, CloudRain, Cloud, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherSummaryCardProps {
  weatherSummary: {
    location: string;
    current: {
      temperature: number;
      condition: string;
      icon: string;
    };
    forecast: Array<{
      time: string;
      temperature: number;
      condition: string;
    }>;
  };
}

const getWeatherIcon = (iconName: string, size: string = "w-6 h-6") => {
  switch (iconName) {
    case 'cloud-sun':
      return <CloudSun className={`${size} text-blue-400`} />;
    case 'Cerah':
      return <Sun className={`${size} text-yellow-400`} />;
    case 'Hujan Ringan':
      return <CloudRain className={`${size} text-blue-500`} />;
    case 'Berawan':
      return <Cloud className={`${size} text-gray-400`} />;
    default:
      return <CloudSun className={`${size} text-blue-400`} />;
  }
};

export function WeatherSummaryCard({ weatherSummary }: WeatherSummaryCardProps) {
  return (
    <Card className="bg-slate-900/80 border-slate-800/50 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-100">
          <Thermometer className="h-5 w-5 text-primary" />
          <span>Prakiraan Cuaca</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          {weatherSummary.current && (
            <div className="flex items-center">
              {getWeatherIcon(weatherSummary.current.icon, "w-12 h-12")}
              <div className="ml-4">
                <p className="text-5xl font-bold text-white">{weatherSummary.current.temperature}°C</p>
                <p className="text-md text-gray-300">{weatherSummary.current.condition}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-400 text-right">{weatherSummary.location}</p>
        </div>
        {weatherSummary.forecast && weatherSummary.forecast.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-700 pt-4 mt-4">
            {weatherSummary.forecast.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <p className="text-xs font-medium text-gray-300 mb-1">{item.time}</p>
                {getWeatherIcon(item.condition, "w-5 h-5")}
                <p className="text-sm text-gray-200 mt-1">{item.temperature}°C</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
