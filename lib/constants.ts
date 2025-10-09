export const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [-11.0, 95.0], // Southwest
  [6.0, 141.0], // Northeast
];

export const DEFAULT_MAP_CENTER: [number, number] = [106.816, -6.2]; // Jakarta
export const DEFAULT_MAP_ZOOM = 10;

export const FLOOD_RISK_COLORS = {
  low: '#10B981', // Green
  medium: '#F59E0B', // Amber
  high: '#EF4444', // Red
  critical: '#7C2D12', // Dark Red
};

export const WEATHER_CONDITIONS = {
  sunny: {
    color: '#F59E0B',
    gradient: 'from-yellow-400 to-orange-500',
    icon: 'sun',
  },
  cloudy: {
    color: '#64748B',
    gradient: 'from-gray-400 to-gray-600',
    icon: 'cloud',
  },
  rainy: {
    color: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600',
    icon: 'cloud-rain',
  },
  stormy: {
    color: '#6B21A8',
    gradient: 'from-purple-600 to-purple-800',
    icon: 'zap',
  },
  foggy: {
    color: '#9CA3AF',
    gradient: 'from-gray-300 to-gray-500',
    icon: 'cloud-fog',
  },
};

export const ALERT_LEVELS = {
  info: {
    color: '#06B6D4',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-900',
    icon: 'info',
  },
  warning: {
    color: '#F59E0B',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-900',
    icon: 'alert-triangle',
  },
  danger: {
    color: '#EF4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    icon: 'alert-circle',
  },
  critical: {
    color: '#7C2D12',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-950',
    icon: 'shield-alert',
  },
};

export const ANIMATION_PRESETS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: 0.6,
      type: 'spring',
      damping: 15,
    },
  },
};

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const MAP_LAYERS = {
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
  },
};

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'layout-dashboard' },
  { id: 'map', label: 'Flood Map', href: '/map', icon: 'map' },
  { id: 'weather', label: 'Weather', href: '/weather', icon: 'cloud' },
  { id: 'alerts', label: 'Alerts', href: '/alerts', icon: 'bell' },
  {
    id: 'statistics',
    label: 'Statistics',
    href: '/statistics',
    icon: 'bar-chart',
  },
  { id: 'settings', label: 'Settings', href: '/settings', icon: 'settings' },
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
  { id: 'depok', name: 'Depok', coordinates: [-6.4, 106.8186] },
];

export const WEATHER_MOCK_DATA = {
  id: 'weather-jakarta',
  regionId: 'jakarta',
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
  timestamp: new Date().toISOString(),
};

export const WEATHER_STATIONS_GLOBAL_MOCK = [
  {
    id: 'ws-jakarta',
    name: 'Stasiun Cuaca Jakarta',
    coordinates: [-6.2, 106.816],
    temperature: 28,
    humidity: 75,
    windSpeed: 12,
    pressure: 1013,
    description: 'Cerah Berawan',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ws-surabaya',
    name: 'Stasiun Cuaca Surabaya',
    coordinates: [-7.2575, 112.7521],
    temperature: 30,
    humidity: 70,
    windSpeed: 15,
    pressure: 1010,
    description: 'Hujan Ringan',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ws-medan',
    name: 'Stasiun Cuaca Medan',
    coordinates: [3.5952, 98.6722],
    temperature: 26,
    humidity: 80,
    windSpeed: 10,
    pressure: 1012,
    description: 'Berawan Tebal',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ws-makassar',
    name: 'Stasiun Cuaca Makassar',
    coordinates: [-5.1477, 119.4327],
    temperature: 29,
    humidity: 72,
    windSpeed: 18,
    pressure: 1009,
    description: 'Cerah',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ws-bandung',
    name: 'Stasiun Cuaca Bandung',
    coordinates: [-6.9175, 107.6191],
    temperature: 24,
    humidity: 85,
    windSpeed: 8,
    pressure: 1015,
    description: 'Hujan Sedang',
    timestamp: new Date().toISOString(),
  },
];

export const FLOOD_MOCK_ALERTS = [
  {
    id: '1',
    regionId: 'jakarta',
    level: 'warning' as const,
    title: 'Flood Warning - North Jakarta',
    message:
      'High tide and heavy rain expected. Stay alert and avoid low-lying areas.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isActive: true,
    affectedAreas: ['Kelapa Gading', 'Ancol', 'Pluit'],
    actions: [
      'Avoid flood-prone areas',
      'Prepare emergency supplies',
      'Monitor updates',
    ],
    coordinates: [-6.1214, 106.7741], // Example coordinate for North Jakarta
  },
  {
    id: '2',
    regionId: 'jakarta',
    level: 'info' as const,
    title: 'Weather Update',
    message:
      'Moderate rainfall expected throughout the day. Roads may be slippery.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isActive: true,
    affectedAreas: ['Central Jakarta', 'South Jakarta'],
    actions: ['Drive carefully', 'Allow extra travel time'],
    coordinates: [-6.2088, 106.8456], // Example coordinate for Central Jakarta
  },
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
      [-6.17, 106.89],
    ] as [number, number][],
    area: 2.5,
    population: 45000,
    lastUpdate: new Date().toISOString(),
    description: 'Flood-prone area due to poor drainage and proximity to sea',
  },
  {
    id: 'zone-2',
    regionId: 'jakarta',
    name: 'Cempaka Putih',
    riskLevel: 'medium' as const,
    coordinates: [
      [-6.18, 106.87],
      [-6.18, 106.89],
      [-6.2, 106.89],
      [-6.2, 106.87],
    ] as [number, number][],
    area: 1.8,
    population: 32000,
    lastUpdate: new Date().toISOString(),
    description: 'Moderate flood risk during heavy rainfall',
  },
];

export const DASHBOARD_STATS_MOCK = {
  totalRegions: 34,
  activeAlerts: 7,
  floodZones: 156,
  peopleAtRisk: 2450000,
  weatherStations: 89,
  lastUpdate: new Date().toISOString(),
};

export const LAPORAN_BANJIR_MOCK = [
  {
    id: 1,
    location: 'Jl. Mangga Dua, Jakarta Utara',
    water_level: 50,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'Siaga 3',
    reporterName: 'Budi Santoso',
  },
  {
    id: 2,
    location: 'Komp. Ciledug Indah, Tangerang',
    water_level: 80,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: 'Siaga 2',
    reporterName: 'Siti Aminah',
  },
  {
    id: 3,
    location: 'Kampung Pulo, Jatinegara',
    water_level: 120,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'Siaga 1',
    reporterName: 'Warga Lokal',
  },
];

export const EVACUATION_LOCATIONS_MOCK = [
  // Jakarta
  {
    id: 1,
    name: 'GOR Otista',
    address: 'Jl. Otto Iskandardinata No.121, Jatinegara, Jakarta Timur',
    latitude: -6.228,
    longitude: 106.869,
    capacity_current: 150,
    capacity_total: 200,
    facilities: ['Tenda', 'Dapur Umum', 'MCK', 'Pos Medis'],
    contact_person: 'Bapak Agus',
    contact_phone: '0812-3456-7890',
    last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'SDN Kampung Melayu 01',
    address: 'Jl. Kebon Pala I No.25, Kampung Melayu, Jakarta Timur',
    latitude: -6.225,
    longitude: 106.855,
    capacity_current: 80,
    capacity_total: 100,
    facilities: ['Ruang Kelas', 'MCK', 'Air Bersih'],
    contact_person: 'Ibu Retno',
    contact_phone: '0812-1111-2222',
    last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  // Surabaya
  {
    id: 3,
    name: 'Gedung Serbaguna Unesa',
    address: 'Jl. Lidah Wetan, Lakarsantri, Surabaya',
    latitude: -7.2892,
    longitude: 112.6742,
    capacity_current: 250,
    capacity_total: 300,
    facilities: ['Aula Besar', 'Dapur Umum', 'Pos Medis'],
    contact_person: 'Bapak Hartono',
    contact_phone: '0813-1234-5678',
    last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Balai RW 05 Rungkut',
    address: 'Jl. Rungkut Asri Tengah, Rungkut, Surabaya',
    latitude: -7.3298,
    longitude: 112.7851,
    capacity_current: 45,
    capacity_total: 50,
    facilities: ['Pendopo', 'MCK'],
    contact_person: 'Ketua RW 05',
    contact_phone: '0819-8765-4321',
    last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  // Bandung
  {
    id: 5,
    name: 'Sabuga ITB',
    address: 'Jl. Tamansari No.73, Bandung',
    latitude: -6.8915,
    longitude: 107.6105,
    capacity_current: 500,
    capacity_total: 750,
    facilities: ['Aula', 'Dapur Umum', 'Pos Medis', 'Area Bermain Anak'],
    contact_person: 'Manajemen Sabuga',
    contact_phone: '022-250-1234',
    last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    name: 'Kantor Kecamatan Baleendah',
    address: 'Jl. Adipati Agung No. 25, Baleendah, Kab. Bandung',
    latitude: -7.0094,
    longitude: 107.6282,
    capacity_current: 120,
    capacity_total: 150,
    facilities: ['Ruang Rapat', 'MCK', 'Dapur Umum'],
    contact_person: 'BPBD Kab. Bandung',
    contact_phone: '022-592-8113',
    last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  // Medan
  {
    id: 7,
    name: 'GOR Mini Dispora Sumut',
    address: 'Jl. Williem Iskandar, Medan',
    latitude: 3.6318,
    longitude: 98.7075,
    capacity_current: 180,
    capacity_total: 250,
    facilities: ['Lapangan Indoor', 'MCK', 'Pos Medis'],
    contact_person: 'Dispora Sumut',
    contact_phone: '061-123-4567',
    last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  // Makassar
  {
    id: 8,
    name: 'Asrama Haji Sudiang',
    address: 'Jl. Asrama Haji, Sudiang, Makassar',
    latitude: -5.0777,
    longitude: 119.5311,
    capacity_current: 400,
    capacity_total: 500,
    facilities: ['Kamar', 'Aula', 'Dapur Umum', 'MCK'],
    contact_person: 'UPT Asrama Haji',
    contact_phone: '0411-551-234',
    last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  // Semarang
  {
    id: 9,
    name: 'Masjid Agung Jawa Tengah',
    address: 'Jl. Gajahraya, Sambirejo, Gayamsari, Semarang',
    latitude: -6.9859,
    longitude: 110.4451,
    capacity_current: 300,
    capacity_total: 400,
    facilities: ['Aula Masjid', 'MCK', 'Dapur Umum'],
    contact_person: 'Takmir Masjid',
    contact_phone: '024-672-5412',
    last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  // Palembang
  {
    id: 10,
    name: 'Gedung DPRD Provinsi Sumsel',
    address: 'Jl. Kapten A. Rivai, Lorok Pakjo, Palembang',
    latitude: -2.9715,
    longitude: 104.7451,
    capacity_current: 200,
    capacity_total: 250,
    facilities: ['Ruang Rapat Paripurna', 'MCK', 'Pos Medis'],
    contact_person: 'Sekretariat DPRD',
    contact_phone: '0711-352-123',
    last_updated: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  // Banjarmasin
  {
    id: 11,
    name: 'SKB Mulawarman',
    address: 'Jl. Mulawarman, Teluk Dalam, Banjarmasin',
    latitude: -3.3186,
    longitude: 114.5893,
    capacity_current: 90,
    capacity_total: 120,
    facilities: ['Aula', 'MCK', 'Dapur Umum'],
    contact_person: 'BPBD Kota Banjarmasin',
    contact_phone: '0511-335-5113',
    last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  // Pontianak
  {
    id: 12,
    name: 'Pontianak Convention Center',
    address: 'Jl. Sultan Syarif Abdurrahman, Pontianak',
    latitude: -0.0458,
    longitude: 109.3422,
    capacity_current: 350,
    capacity_total: 500,
    facilities: ['Exhibition Hall', 'MCK', 'Pos Medis'],
    contact_person: 'Manajemen PCC',
    contact_phone: '0561-765-432',
    last_updated: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  // Denpasar
  {
    id: 13,
    name: 'GOR Lila Bhuana',
    address: 'Jl. Melati, Dangin Puri Kangin, Denpasar',
    latitude: -8.6548,
    longitude: 115.2217,
    capacity_current: 150,
    capacity_total: 200,
    facilities: ['Lapangan Indoor', 'MCK'],
    contact_person: 'Disdikpora Denpasar',
    contact_phone: '0361-222-333',
    last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Yogyakarta
  {
    id: 14,
    name: 'Jogja Expo Center (JEC)',
    address: 'Jl. Raya Janti, Banguntapan, Bantul',
    latitude: -7.7971,
    longitude: 110.4080,
    capacity_current: 800,
    capacity_total: 1000,
    facilities: ['Hall Pameran', 'Dapur Umum', 'Pos Medis', 'MCK'],
    contact_person: 'Manajemen JEC',
    contact_phone: '0274-454-123',
    last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  // Pekanbaru
  {
    id: 15,
    name: 'Gedung Olahraga Remaja',
    address: 'Jl. Jenderal Sudirman, Simpang Tiga, Pekanbaru',
    latitude: 0.4761,
    longitude: 101.4533,
    capacity_current: 220,
    capacity_total: 300,
    facilities: ['GOR', 'MCK', 'Dapur Lapangan'],
    contact_person: 'BPBD Riau',
    contact_phone: '0761-123-911',
    last_updated: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
  },
  // Manado
  {
    id: 16,
    name: 'Balai Diklat Keagamaan Manado',
    address: 'Jl. A.A. Maramis, Kairagi Weru, Manado',
    latitude: 1.5089,
    longitude: 124.8812,
    capacity_current: 100,
    capacity_total: 150,
    facilities: ['Asrama', 'Aula', 'MCK'],
    contact_person: 'Kementerian Agama',
    contact_phone: '0431-811-234',
    last_updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Kupang
  {
    id: 17,
    name: 'GOR Flobamora Oepoi',
    address: 'Jl. W. J. Lalamentik, Oebufu, Kupang',
    latitude: -10.1644,
    longitude: 123.6113,
    capacity_current: 180,
    capacity_total: 200,
    facilities: ['GOR', 'MCK', 'Posko Bantuan'],
    contact_person: 'BPBD NTT',
    contact_phone: '0380-833-111',
    last_updated: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  // Jayapura
  {
    id: 18,
    name: 'Stadion Mandala',
    address: 'Jl. Raya Mandala, Dok V, Jayapura',
    latitude: -2.5378,
    longitude: 140.7133,
    capacity_current: 500,
    capacity_total: 600,
    facilities: ['Tribun', 'MCK', 'Dapur Umum', 'Pos Medis'],
    contact_person: 'Dispora Papua',
    contact_phone: '0967-533-777',
    last_updated: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
  },
  // Ambon
  {
    id: 19,
    name: 'LPMP Provinsi Maluku',
    address: 'Jl. Tihu, Wailela, Teluk Ambon',
    latitude: -3.6572,
    longitude: 128.1781,
    capacity_current: 130,
    capacity_total: 150,
    facilities: ['Wisma', 'Aula', 'MCK'],
    contact_person: 'LPMP Maluku',
    contact_phone: '0911-361-888',
    last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Mataram
  {
    id: 20,
    name: 'Islamic Center NTB',
    address: 'Jl. Udayana, Gomong, Selaparang, Mataram',
    latitude: -8.5823,
    longitude: 116.1045,
    capacity_current: 600,
    capacity_total: 800,
    facilities: ['Aula Masjid', 'MCK', 'Dapur Umum', 'Pos Medis'],
    contact_person: 'Pengurus Islamic Center',
    contact_phone: '0370-617-0123',
    last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  // Padang
  {
    id: 21,
    name: 'GOR H. Agus Salim',
    address: 'Jl. Rasuna Said, Rimbo Kaluang, Padang',
    latitude: -0.9278,
    longitude: 100.3525,
    capacity_current: 280,
    capacity_total: 400,
    facilities: ['GOR', 'MCK', 'Dapur Umum', 'Pos Medis'],
    contact_person: 'BPBD Kota Padang',
    contact_phone: '0751-123-456',
    last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  // Samarinda
  {
    id: 22,
    name: 'GOR Segiri',
    address: 'Jl. Kesuma Bangsa, Bugis, Samarinda',
    latitude: -0.4983,
    longitude: 117.1444,
    capacity_current: 190,
    capacity_total: 250,
    facilities: ['GOR', 'MCK', 'Posko Bantuan'],
    contact_person: 'Dispora Samarinda',
    contact_phone: '0541-741-234',
    last_updated: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  // Serang
  {
    id: 23,
    name: 'Gedung Juang 45',
    address: 'Jl. Jenderal Sudirman No.1, Sumurpecung, Serang',
    latitude: -6.1186,
    longitude: 106.1549,
    capacity_current: 75,
    capacity_total: 100,
    facilities: ['Aula', 'MCK'],
    contact_person: 'Dinsos Serang',
    contact_phone: '0254-200-123',
    last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  // Kendari
  {
    id: 24,
    name: 'Aula Kantor Gubernur Sultra',
    address: 'Jl. Halu Oleo, Mokoau, Kendari',
    latitude: -3.9931,
    longitude: 122.5167,
    capacity_current: 200,
    capacity_total: 250,
    facilities: ['Aula', 'MCK', 'Dapur Umum'],
    contact_person: 'Biro Umum Setda Sultra',
    contact_phone: '0401-312-888',
    last_updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Palu
  {
    id: 25,
    name: 'Gedung Olahraga Siranindi',
    address: 'Jl. Moh. Hatta, Lolu Utara, Palu',
    latitude: -0.9007,
    longitude: 119.8756,
    capacity_current: 150,
    capacity_total: 200,
    facilities: ['GOR', 'MCK', 'Pos Medis'],
    contact_person: 'BPBD Kota Palu',
    contact_phone: '0451-421-112',
    last_updated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  // Banda Aceh
  {
    id: 26,
    name: 'Museum Tsunami Aceh',
    address: 'Jl. Sultan Iskandar Muda, Sukaramai, Banda Aceh',
    latitude: 5.5483,
    longitude: 95.3142,
    capacity_current: 300,
    capacity_total: 400,
    facilities: ['Area Pameran', 'MCK', 'Pos Medis'],
    contact_person: 'Manajemen Museum',
    contact_phone: '0651-35-111',
    last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  // Tangerang
  {
    id: 27,
    name: 'Pusat Pemerintahan Kota Tangerang',
    address: 'Jl. Satria Sudirman No. 1, Sukaasih, Tangerang',
    latitude: -6.1783,
    longitude: 106.6319,
    capacity_current: 250,
    capacity_total: 300,
    facilities: ['Aula', 'MCK', 'Dapur Umum'],
    contact_person: 'BPBD Kota Tangerang',
    contact_phone: '021-557-91-113',
    last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Bekasi
  {
    id: 28,
    name: 'Stadion Patriot Candrabhaga',
    address: 'Jl. Guntur, Kayuringin Jaya, Bekasi',
    latitude: -6.2431,
    longitude: 106.9945,
    capacity_current: 1000,
    capacity_total: 1500,
    facilities: ['Tribun', 'MCK', 'Dapur Umum', 'Pos Medis'],
    contact_person: 'Dispora Bekasi',
    contact_phone: '021-889-54-321',
    last_updated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  // Depok
  {
    id: 29,
    name: 'Balai Kota Depok',
    address: 'Jl. Margonda Raya No.54, Depok',
    latitude: -6.3933,
    longitude: 106.8245,
    capacity_current: 150,
    capacity_total: 200,
    facilities: ['Aula', 'MCK', 'Pos Medis'],
    contact_person: 'BPBD Kota Depok',
    contact_phone: '021-777-55-113',
    last_updated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  // Bogor
  {
    id: 30,
    name: 'GOR Pajajaran',
    address: 'Jl. Pemuda No.4, Tanah Sareal, Bogor',
    latitude: -6.5826,
    longitude: 106.7912,
    capacity_current: 300,
    capacity_total: 400,
    facilities: ['GOR', 'MCK', 'Dapur Umum'],
    contact_person: 'Dispora Bogor',
    contact_phone: '0251-833-12-34',
    last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  // Cilegon
  {
    id: 31,
    name: 'Alun-Alun Kota Cilegon',
    address: 'Jl. Jenderal Sudirman, Ramanuju, Cilegon',
    latitude: -6.0181,
    longitude: 106.0582,
    capacity_current: 50,
    capacity_total: 100,
    facilities: ['Tenda Lapangan', 'MCK Mobile'],
    contact_person: 'BPBD Cilegon',
    contact_phone: '0254-39-111-3',
    last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Karawang
  {
    id: 32,
    name: 'Gedung Serbaguna Pemda Karawang',
    address: 'Jl. Ahmad Yani No.1, Karawang',
    latitude: -6.3025,
    longitude: 107.3063,
    capacity_current: 200,
    capacity_total: 250,
    facilities: ['Aula', 'MCK', 'Dapur Umum'],
    contact_person: 'BPBD Karawang',
    contact_phone: '0267-40-111-3',
    last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  // Purwakarta
  {
    id: 33,
    name: 'Bale Yudistira',
    address: 'Jl. K.K Singawinata, Nagri Kaler, Purwakarta',
    latitude: -6.5517,
    longitude: 107.4439,
    capacity_current: 100,
    capacity_total: 150,
    facilities: ['Pendopo', 'MCK'],
    contact_person: 'BPBD Purwakarta',
    contact_phone: '0264-20-111-3',
    last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  // Indramayu
  {
    id: 34,
    name: 'GOR Dharma Ayu',
    address: 'Jl. Olahraga, Karanganyar, Indramayu',
    latitude: -6.3333,
    longitude: 108.3264,
    capacity_current: 150,
    capacity_total: 200,
    facilities: ['GOR', 'MCK', 'Dapur Umum'],
    contact_person: 'BPBD Indramayu',
    contact_phone: '0234-27-111-3',
    last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  // Cirebon
  {
    id: 35,
    name: 'Stadion Bima',
    address: 'Jl. Brigjen Dharsono, Sunyaragi, Cirebon',
    latitude: -6.7333,
    longitude: 108.5333,
    capacity_current: 400,
    capacity_total: 500,
    facilities: ['Tribun', 'MCK', 'Dapur Umum', 'Pos Medis'],
    contact_person: 'BPBD Kota Cirebon',
    contact_phone: '0231-48-111-3',
    last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  }
];
