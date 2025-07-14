// app/peta-banjir/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Bell,
  Search,
  Loader2,
  ChevronLeft,
  Filter,
  Layers,
  Waves,
  Pump, // New icon for pumps
  CloudRain, // New icon for precipitation layer
} from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FloodMap } from "@/components/map/FloodMap";
import { RegionDropdown } from "@/components/region-selector/RegionDropdown";
import {
  fetchDisasterProneData,
  OverpassElement,
  fetchWaterLevelData,
  WaterLevelPost,
  fetchPumpStatusData,
  PumpData,
  fetchPetabencanaReports,
  PetabencanaReport,
  geocodeLocation, // Import geocodeLocation
  NominatimResult, // Import NominatimResult
} from "@/lib/api";
import { FloodAlert as FloodAlertType } from "@/types";

interface SelectedLocationDetails {
  districtCode: string;
  districtName: string;
  regencyCode: string;
  provinceCode: string;
  latitude?: number;
  longitude?: number;
  geometry?: string;
}

export default function PetaBanjirPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationDetails | null>(null);
  const [currentMapCenter, setCurrentMapCenter] =
    useState<[number, number]>(DEFAULT_MAP_CENTER);
  const [currentMapZoom, setCurrentMapZoom] = useState(DEFAULT_MAP_ZOOM);

  // Data for map overlays
  const [disasterProneAreas, setDisasterProneAreas] = useState<
    OverpassElement[]
  >([]);
  const [loadingDisasterData, setLoadingDisasterData] = useState(false);
  const [disasterDataError, setDisasterDataError] = useState<string | null>(
    null
  );

  const [waterLevelPosts, setWaterLevelPosts] = useState<WaterLevelPost[]>([]);
  const [loadingWaterLevel, setLoadingWaterLevel] = useState(false);
  const [waterLevelError, setWaterLevelError] = useState<string | null>(null);

  const [pumpStatusData, setPumpStatusData] = useState<PumpData[]>([]);
  const [loadingPumpStatus, setLoadingPumpStatus] = useState(false);
  const [pumpStatusError, setPumpStatusError] = useState<string | null>(null);

  const [petabencanaReports, setPetabencanaReports] = useState<
    PetabencanaReport[]
  >([]);
  const [loadingPetabencana, setLoadingPetabencana] = useState(false);
  const [petabencanaError, setPetabencanaError] = useState<string | null>(null);

  // Map Controls States - Pastikan state ini diatur dan diteruskan
  const [showFloodZones, setShowFloodZones] = useState(true); // Overpass API data
  // NOTE: Stasiun Cuaca Mocked, jadi togglenya ada di FloodMap
  const [showWaterLevelPosts, setShowWaterLevelPosts] = useState(true);
  const [showPumpStatus, setShowPumpStatus] = useState(true);
  const [showPetabencanaReports, setShowPetabencanaReports] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState("street"); // Base map layer
  const [showMapFilters, setShowMapFilters] = useState(true); // Toggle filter panel

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchLocationError, setSearchLocationError] = useState<string | null>(
    null
  );

  // Fetch initial data on component mount
  useEffect(() => {
    // Fetch Water Level Data
    setLoadingWaterLevel(true);
    fetchWaterLevelData()
      .then((data) => setWaterLevelPosts(data))
      .catch((err) => setWaterLevelError(err.message))
      .finally(() => setLoadingWaterLevel(false));

    // Fetch Pump Status Data
    setLoadingPumpStatus(true);
    fetchPumpStatusData()
      .then((data) => setPumpStatusData(data))
      .catch((err) => setPumpStatusError(err.message))
      .finally(() => setLoadingPumpStatus(false));

    // Fetch PetaBencana Reports (e.g., flood reports from last 24h)
    setLoadingPetabencana(true);
    fetchPetabencanaReports("flood", "24h")
      .then((data) => setPetabencanaReports(data))
      .catch((err) => setPetabencanaError(err.message))
      .finally(() => setLoadingPetabencana(false));
  }, []); // Empty dependency array means this runs once on mount

  // Update Overpass data based on map bounds or selected location
  useEffect(() => {
    const fetchOverpassData = async () => {
      if (selectedLocation?.latitude && selectedLocation?.longitude) {
        setLoadingDisasterData(true);
        setDisasterDataError(null);
        // Create a bounding box around the selected location
        const buffer = 0.05; // degree, adjust as needed
        const south = selectedLocation.latitude - buffer;
        const west = selectedLocation.longitude - buffer;
        const north = selectedLocation.latitude + buffer;
        const east = selectedLocation.longitude + buffer;

        try {
          const data = await fetchDisasterProneData(south, west, north, east);
          setDisasterProneAreas(data.elements);
          console.log("Overpass data for selected location:", data.elements);
        } catch (err: any) {
          console.error("Error fetching Overpass data:", err);
          setDisasterDataError(err.message);
        } finally {
          setLoadingDisasterData(false);
        }
      } else {
        setDisasterProneAreas([]); // Clear if no location selected
        setLoadingDisasterData(false);
      }
    };
    fetchOverpassData();
  }, [selectedLocation]); // Re-fetch when selectedLocation changes

  const handleRegionSelect = (
    districtCode: string,
    districtName: string,
    regencyCode: string,
    provinceCode: string,
    latitude?: number,
    longitude?: number
  ) => {
    const newLocation: SelectedLocationDetails = {
      districtCode,
      districtName,
      regencyCode,
      provinceCode,
      latitude,
      longitude,
    };
    setSelectedLocation(newLocation);
    if (latitude != null && longitude != null) {
      setCurrentMapCenter([latitude, longitude]);
      setCurrentMapZoom(12); // Zoom in when a specific district is selected
    } else {
      setCurrentMapCenter(DEFAULT_MAP_CENTER);
      setCurrentMapZoom(DEFAULT_MAP_ZOOM);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearchingLocation(true);
    setSearchLocationError(null);

    try {
      const results: NominatimResult[] = await geocodeLocation(searchQuery);
      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);

        setSelectedLocation({
          districtCode: "",
          districtName: display_name,
          regencyCode: "",
          provinceCode: "",
          latitude: newLat,
          longitude: newLon,
        });
        setCurrentMapCenter([newLat, newLon]);
        setCurrentMapZoom(13); // Zoom closer to searched location
        setSearchQuery(""); // Clear search bar
      } else {
        setSearchLocationError("Lokasi tidak ditemukan.");
      }
    } catch (error: any) {
      console.error("Geocoding error:", error);
      setSearchLocationError(
        error.message || "Gagal mencari lokasi. Coba lagi."
      );
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Combine all relevant data for FloodMap component
  const allMapElements = [];

  // Add Water Level Posts to map elements
  waterLevelPosts.forEach((post) => {
    if (post.lat && post.lon) {
      allMapElements.push({
        id: `tma-${post.id}`,
        position: [post.lat, post.lon],
        type: "water-level",
        title: `Pos Duga Air: ${post.name}`,
        description: `Tinggi: ${post.water_level || "N/A"} ${
          post.unit || "m"
        }, Status: ${post.status || "N/A"}`,
        severity:
          post.status?.toLowerCase().includes("awas") ||
          (post.water_level && post.water_level > 2) // Contoh: >2m awas
            ? "critical"
            : post.status?.toLowerCase().includes("siaga") ||
              (post.water_level && post.water_level > 1) // Contoh: >1m siaga
            ? "high"
            : "info",
        timestamp: post.timestamp,
      });
    }
  });

  // Add Pump Status Data to map elements
  pumpStatusData.forEach((pump) => {
    if (pump.latitude && pump.longitude) {
      let pumpSeverity: FloodAlertType["level"] = "info";
      if (
        pump.kondisi_bangunan?.toLowerCase().includes("rusak") ||
        pump.kondisi_bangunan?.toLowerCase().includes("tidak beroperasi")
      ) {
        pumpSeverity = "danger";
      } else if (pump.kondisi_bangunan?.toLowerCase().includes("beroperasi")) {
        pumpSeverity = "info";
      }
      allMapElements.push({
        id: `pump-${pump.id}`,
        position: [pump.latitude, pump.longitude],
        type: "pump-station",
        title: `Pompa: ${pump.nama_infrastruktur}`,
        description: `Kondisi: ${pump.kondisi_bangunan}, Tipe: ${pump.tipe_hidrologi}`,
        severity: pumpSeverity,
        timestamp: pump.updated_at
          ? new Date(pump.updated_at * 1000).toISOString()
          : new Date().toISOString(),
      });
    }
  });

  // Add PetaBencana Reports to map elements
  petabencanaReports.forEach((report) => {
    if (report.geom?.coordinates && report.geom.type === "Point") {
      const [lon, lat] = report.geom.coordinates;
      let reportSeverity: FloodAlertType["level"] = "info";
      if (
        report.status?.toLowerCase().includes("siaga") ||
        report.status?.toLowerCase().includes("awas")
      ) {
        reportSeverity = "danger";
      } else if (report.severity && report.severity >= 5) {
        reportSeverity = "warning";
      }
      allMapElements.push({
        id: `pb-${report._id}`,
        position: [lat, lon],
        type: "petabencana-report",
        title: `Laporan: ${report.event_type || report.cat}`,
        message: report.detail.id,
        severity: reportSeverity,
        timestamp: new Date(report.timestamp).toISOString(),
        affectedAreas: report.detail.id
          .split(/[,.;]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      });
    }
    // If there's geometry for polygons, you might need a different handling or convert them to a central point marker
    // For now, we only handle 'Point' type geometries for simplicity in markers.
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="p-2 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Peta Banjir Interaktif
              </h1>
              <p className="text-slate-400 mt-1">
                Visualisasi data bencana dan monitoring real-time
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Controls and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-lg">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari lokasi di peta (contoh: Jakarta, Bandung)..."
                  className="w-full pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearchLocation();
                    }
                  }}
                  disabled={isSearchingLocation}
                />
                {isSearchingLocation && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-spin" />
                )}
              </div>
              <Button
                onClick={handleSearchLocation}
                disabled={isSearchingLocation}
              >
                Cari
              </Button>
            </CardContent>
            {searchLocationError && (
              <Alert variant="destructive" className="mx-4 mb-4">
                <AlertDescription>{searchLocationError}</AlertDescription>
              </Alert>
            )}
          </Card>

          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-lg">
            <CardContent className="p-4">
              <RegionDropdown
                onSelectDistrict={handleRegionSelect}
                selectedLocationCoords={
                  selectedLocation?.latitude != null &&
                  selectedLocation?.longitude != null
                    ? {
                        lat: selectedLocation.latitude,
                        lng: selectedLocation.longitude,
                        name: selectedLocation.districtName,
                      }
                    : null
                }
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Map Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn("lg:w-1/4 flex-shrink-0", isMobile && "w-full")}
          >
            <Card className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  <span>Filter Peta</span>
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMapFilters(!showMapFilters)}
                >
                  {showMapFilters ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {showMapFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <h4 className="text-md font-medium text-slate-300">
                        Lapisan Dasar
                      </h4>
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant={
                            selectedLayer === "street" ? "secondary" : "ghost"
                          }
                          onClick={() => setSelectedLayer("street")}
                          className="justify-start text-sm"
                        >
                          <Layers className="mr-2 h-4 w-4" /> OpenStreetMap
                        </Button>
                        <Button
                          variant={
                            selectedLayer === "satellite"
                              ? "secondary"
                              : "ghost"
                          }
                          onClick={() => setSelectedLayer("satellite")}
                          className="justify-start text-sm"
                        >
                          <Layers className="mr-2 h-4 w-4" /> Satelit
                        </Button>
                        <Button
                          variant={
                            selectedLayer === "terrain" ? "secondary" : "ghost"
                          }
                          onClick={() => setSelectedLayer("terrain")}
                          className="justify-start text-sm"
                        >
                          <Layers className="mr-2 h-4 w-4" /> Terrain
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-md font-medium text-slate-300">
                        Data Overlay
                      </h4>
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          onClick={() => setShowFloodZones(!showFloodZones)}
                          className="justify-between text-sm"
                        >
                          <span className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" /> Zona Rawan
                            Bencana
                          </span>
                          <Badge
                            variant={showFloodZones ? "success" : "secondary"}
                          >
                            {showFloodZones ? "ON" : "OFF"}
                          </Badge>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setShowWaterLevelPosts(!showWaterLevelPosts)
                          }
                          className="justify-between text-sm"
                        >
                          <span className="flex items-center">
                            <Waves className="mr-2 h-4 w-4" /> Pos Duga Air
                            (TMA)
                          </span>
                          <Badge
                            variant={
                              showWaterLevelPosts ? "success" : "secondary"
                            }
                          >
                            {showWaterLevelPosts ? "ON" : "OFF"}
                          </Badge>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowPumpStatus(!showPumpStatus)}
                          className="justify-between text-sm"
                        >
                          <span className="flex items-center">
                            <Pump className="mr-2 h-4 w-4" /> Status Pompa
                          </span>
                          <Badge
                            variant={showPumpStatus ? "success" : "secondary"}
                          >
                            {showPumpStatus ? "ON" : "OFF"}
                          </Badge>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setShowPetabencanaReports(!showPetabencanaReports)
                          }
                          className="justify-between text-sm"
                        >
                          <span className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" /> Laporan
                            PetaBencana.id
                          </span>
                          <Badge
                            variant={
                              showPetabencanaReports ? "success" : "secondary"
                            }
                          >
                            {showPetabencanaReports ? "ON" : "OFF"}
                          </Badge>
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-between text-sm"
                        >
                          <span className="flex items-center">
                            <CloudRain className="mr-2 h-4 w-4" /> Layer Cuaca
                            (Rain/Wind)
                          </span>
                          <Badge variant="secondary">OFF (Soon)</Badge>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Main Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-3/4"
          >
            <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-lg rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-700/30 border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <span>Peta Interaktif</span>
                  {selectedLocation?.districtName && (
                    <Badge variant="outline" className="ml-2">
                      {selectedLocation.districtName}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: "700px", width: "100%" }}>
                  <FloodMap
                    center={currentMapCenter}
                    zoom={currentMapZoom}
                    selectedLayer={selectedLayer}
                    floodProneData={showFloodZones ? disasterProneAreas : []}
                    loadingFloodData={loadingDisasterData}
                    floodDataError={disasterDataError}
                    realtimeFloodAlerts={
                      [
                        ...(showWaterLevelPosts
                          ? allMapElements.filter(
                              (el) => el.type === "water-level"
                            )
                          : []),
                        ...(showPumpStatus
                          ? allMapElements.filter(
                              (el) => el.type === "pump-station"
                            )
                          : []),
                        ...(showPetabencanaReports
                          ? allMapElements.filter(
                              (el) => el.type === "petabencana-report"
                            )
                          : []),
                      ] as FloodAlertType[]
                    } // Cast to FloodAlertType[]
                    // Loading and error states for combined alerts
                    loadingRealtimeAlerts={
                      loadingWaterLevel ||
                      loadingPumpStatus ||
                      loadingPetabencana
                    }
                    realtimeAlertsError={
                      waterLevelError || pumpStatusError || petabencanaError
                    }
                    // Meneruskan state dan setter ke FloodMap
                    showFloodZones={showFloodZones}
                    setShowFloodZones={setShowFloodZones}
                    showWaterLevelPosts={showWaterLevelPosts}
                    setShowWaterLevelPosts={setShowWaterLevelPosts}
                    showPumpStatus={showPumpStatus}
                    setShowPumpStatus={setShowPumpStatus}
                    showPetabencanaReports={showPetabencanaReports}
                    setShowPetabencanaReports={setShowPetabencanaReports}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
