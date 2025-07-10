export const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [-11.0, 95.0], // Southwest
  [6.0, 141.0]   // Northeast
];

export const DEFAULT_MAP_CENTER: [number, number] = [-6.2, 106.816]; // Jakarta
export const DEFAULT_MAP_ZOOM = 10;

export const FLOOD_RISK_COLORS = {
  low: '#10B981',      // Green
  medium: '#F59E0B',   // Amber
  high: '#EF4444',     // Red
  critical: '#7C2D12'  // Dark Red
};

export const WEATHER_CONDITIONS = {
  sunny: {
    color: '#F59E0B',
    gradient: 'from-yellow-400 to-orange-500',
    icon: 'sun'
  },
  cloudy: {
    color: '#64748B',
    gradient: 'from-gray-400 to-gray-600',
    icon: 'cloud'
  },
  rainy: {
    color: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600',
    icon: 'cloud-rain'
  },
  stormy: {
    color: '#6B21A8',
    gradient: 'from-purple-600 to-purple-800',
    icon: 'zap'
  },
  foggy: {
    color: '#9CA3AF',
    gradient: 'from-gray-300 to-gray-500',
    icon: 'cloud-fog'
  }
};

export const ALERT_LEVELS = {
  info: {
    color: '#06B6D4',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-900',
    icon: 'info'
  },
  warning: {
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    icon: 'alert-triangle'
  },
  danger: {
    color: '#EF4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    icon: 'alert-circle'
  },
  critical: {
    color: '#7C2D12',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-950',
    icon: 'shield-alert'
  }
};

export const ANIMATION_PRESETS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.6,
      type: "spring",
      damping: 15
    }
  }
};

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};

export const MAP_LAYERS = {
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors'
  }
};

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'layout-dashboard' },
  { id: 'map', label: 'Flood Map', href: '/map', icon: 'map' },
  { id: 'weather', label: 'Weather', href: '/weather', icon: 'cloud' },
  { id: 'alerts', label: 'Alerts', href: '/alerts', icon: 'bell' },
  { id: 'statistics', label: 'Statistics', href: '/statistics', icon: 'bar-chart' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'settings' }
];

export const INDONESIA_REGIONS = [
  { id: 'jakarta', name: 'Jakarta', coordinates: [-6.2, 106.816] },
  { id: 'surabaya', name: 'Surabaya', coordinates: [-7.2575, 112.7521] },
  { id: 'bandung', name: 'Bandung', coordinates: [-6.9175, 107.6191] },
  { id: 'medan', name: 'Medan', coordinates: [3.5952, 98.6722] },
  { id: 'semarang', name: 'Semarang', coordinates: [-6.9667, 110.4167] },
  { id: 'makassar', name: 'Makassar', coordinates: [-5.1477, 119.4327] },
  { id: 'palembang', name: 'Palembang', coordinates: [-2.9761, 104.7754] },
  { id: 'tangerang', name: 'Tangerang', coordinates: [-6.1783, 106.6319] },
  { id: 'bekasi', name: 'Bekasi', coordinates: [-6.2383, 106.9756] },
  { id: 'depok', name: 'Depok', coordinates: [-6.4, 106.8186] }
];

export const WEATHER_MOCK_DATA = {
  temperature: 28,
  humidity: 75,
  windSpeed: 12,
  windDirection: 'SE',
  pressure: 1013,
  visibility: 10,
  uvIndex: 6,
  condition: 'cloudy' as const,
  description: 'Partly cloudy with chance of rain',
  icon: 'cloud',
  timestamp: new Date().toISOString()
};

export const FLOOD_MOCK_ALERTS = [
  {
    id: '1',
    regionId: 'jakarta',
    level: 'warning' as const,
    title: 'Flood Warning - North Jakarta',
    message: 'High tide and heavy rain expected. Stay alert and avoid low-lying areas.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isActive: true,
    affectedAreas: ['Kelapa Gading', 'Ancol', 'Pluit'],
    actions: ['Avoid flood-prone areas', 'Prepare emergency supplies', 'Monitor updates']
  },
  {
    id: '2',
    regionId: 'jakarta',
    level: 'info' as const,
    title: 'Weather Update',
    message: 'Moderate rainfall expected throughout the day. Roads may be slippery.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isActive: true,
    affectedAreas: ['Central Jakarta', 'South Jakarta'],
    actions: ['Drive carefully', 'Allow extra travel time']
  }
];

export const FLOOD_ZONES_MOCK = [
  {
    id: 'zone-1',
    regionId: 'jakarta',
    name: 'Kelapa Gading',
    riskLevel: 'high' as const,
    coordinates: [
      [-6.15, 106.89],
      [-6.15, 106.91],
      [-6.17, 106.91],
      [-6.17, 106.89]
    ] as [number, number][],
    area: 2.5,
    population: 45000,
    lastUpdate: new Date().toISOString(),
    description: 'Flood-prone area due to poor drainage and proximity to sea'
  },
  {
    id: 'zone-2',
    regionId: 'jakarta',
    name: 'Cempaka Putih',
    riskLevel: 'medium' as const,
    coordinates: [
      [-6.18, 106.87],
      [-6.18, 106.89],
      [-6.20, 106.89],
      [-6.20, 106.87]
    ] as [number, number][],
    area: 1.8,
    population: 32000,
    lastUpdate: new Date().toISOString(),
    description: 'Moderate flood risk during heavy rainfall'
  }
];

export const DASHBOARD_STATS_MOCK = {
  totalRegions: 34,
  activeAlerts: 7,
  floodZones: 156,
  peopleAtRisk: 2450000,
  weatherStations: 89,
  lastUpdate: new Date().toISOString()
};