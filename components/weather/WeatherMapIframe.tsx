// src/components/weather/WeatherMapIframe.tsx
"use client"; // Penting untuk komponen client-side

import React from "react";
import { WeatherData } from "@/lib/api"; // Pastikan path ini benar
import { DEFAULT_MAP_CENTER } from "@/lib/constants"; // Pastikan path ini benar

interface WeatherMapIframeProps {
  selectedLocationCoords?: { lat: number; lng: number; name: string } | null;
  currentWeatherData?: WeatherData | null;
  loadingWeather?: boolean;
  weatherError?: string | null;
  // Jika Anda ingin height yang dinamis, tambahkan prop ini:
  height?: string;
}

export function WeatherMapIframe({
  selectedLocationCoords,
  currentWeatherData,
  loadingWeather,
  weatherError,
  height = "100%", // Default height
}: WeatherMapIframeProps) {
  const generateIframeHtml = () => {
    // Gunakan koordinat lokasi terpilih atau default jika belum ada
    const lat = selectedLocationCoords?.lat || DEFAULT_MAP_CENTER[0];
    const lng = selectedLocationCoords?.lng || DEFAULT_MAP_CENTER[1];
    const zoom = selectedLocationCoords ? 10 : 5; // Zoom in if location selected

    let weatherContentHtml = ``;
    let locationName = selectedLocationCoords?.name || "Indonesia";

    // PENTING: Cek apakah koordinat yang dipilih valid
    const hasValidCoords =
      selectedLocationCoords?.lat != null &&
      selectedLocationCoords?.lng != null;

    if (
      !hasValidCoords &&
      selectedLocationCoords &&
      selectedLocationCoords.name
    ) {
      // Jika lokasi dipilih (ada nama) tapi koordinat tidak ada
      weatherContentHtml = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:#ef4444; font-size:14px;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
                                    <circle cx="12" cy="9" r="3"></circle>
                                </svg>
                                <span>Koordinat tidak ditemukan untuk ${locationName}.</span>
                                <span style="display:block; font-size:12px; color:#a0aec0; margin-top:4px;">Peta mungkin tidak akurat atau cuaca tidak tersedia.</span>
                              </div>`;
    } else if (loadingWeather) {
      weatherContentHtml = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:14px; display:flex; align-items:center; gap:8px;">
                            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                            <span>Memuat cuaca...</span>
                          </div>`;
    } else if (weatherError) {
      weatherContentHtml = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#ef4444; font-size:14px; display:flex; align-items:center; gap:8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            <span>Error: ${weatherError}</span>
                          </div>`;
    } else if (currentWeatherData) {
      const iconCode = currentWeatherData.icon;
      let emojiIcon = "☁️"; // Default: Cloud
      let bgColor = "#64748B"; // Default: Gray for cloud
      let textColor = "white";

      // Logic untuk menentukan emoji dan warna berdasarkan iconCode OpenWeatherMap
      if (iconCode.startsWith("01")) {
        // Clear sky (day/night)
        emojiIcon = iconCode === "01d" ? "☀️" : "✨"; // Sun for day, Sparkles for clear night
        bgColor = iconCode === "01d" ? "#F59E0B" : "#3B82F6"; // Amber for sun, Blue for night
        textColor = "black"; // Black text for bright icons
      } else if (iconCode.startsWith("02")) {
        // Few clouds
        emojiIcon = "🌤️";
        bgColor = "#7DD3FC"; // Light blue for few clouds
      } else if (iconCode.startsWith("03") || iconCode.startsWith("04")) {
        // Scattered/broken clouds
        emojiIcon = "☁️";
        bgColor = "#64748B"; // Gray for clouds
      } else if (iconCode.startsWith("09") || iconCode.startsWith("10")) {
        // Rain/shower rain
        emojiIcon = "🌧️";
        bgColor = "#3B82F6"; // Blue for rain
      } else if (iconCode.startsWith("11")) {
        // Thunderstorm
        emojiIcon = "🌩️";
        bgColor = "#6B21A8"; // Purple for thunderstorm
      } else if (iconCode.startsWith("13")) {
        // Snow
        emojiIcon = "🌨️";
        bgColor = "#BFDBFE"; // Light blue for snow
      } else if (iconCode.startsWith("50")) {
        // Mist/fog
        emojiIcon = "🌫️";
        bgColor = "#9CA3AF"; // Gray for mist
      }

      weatherContentHtml = `
          <div class="main-info">
            <div style="font-size: 50px; text-align: center; background-color: ${bgColor}; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: ${textColor};">${emojiIcon}</div>
            <div>
              <div class="temp">${Math.round(
                currentWeatherData.temperature
              )}°C</div>
              <div class="desc">${currentWeatherData.description}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #63b3ed;">${locationName}</div>
            <div style="font-size: 11px; color: #cbd5e0;">
              Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}
            </div>
          </div>
      `;
    } else {
      // Default state when no location is selected or data is not yet loaded/errored
      weatherContentHtml = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:14px;">Pilih lokasi untuk melihat cuaca.</div>`;
    }

    // OpenWeatherMap API key - dalam production, ini harus disembunyikan
    const OPENWEATHER_API_KEY = "b48e2782f52bd9c6783ef14a35856abc";

    return `<!DOCTYPE html>
      <html>
      <head>
        <title>Peta Cuaca dengan Overlay Awan</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #1a202c; overflow: hidden; }
          #map { height: 100% !important; width: 100% !important; background: #2d3748; }
          .leaflet-container { background: #2d3748; }
          
          .weather-overlay {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 12px;
            z-index: 1000;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          }
          
          .weather-overlay .main-info {
              display: flex;
              align-items: center;
              gap: 12px;
          }
          
          .weather-overlay .temp {
              font-size: 28px;
              font-weight: bold;
              color: #63b3ed;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .weather-overlay .desc {
              font-size: 13px;
              color: #e2e8f0;
              text-transform: capitalize;
              margin-top: 2px;
          }
          
          .loading-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            z-index: 2000;
            background: rgba(0,0,0,0.7);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          
          .weather-controls {
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .weather-control-btn {
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
            backdrop-filter: blur(5px);
            transition: all 0.2s ease;
          }
          
          .weather-control-btn:hover {
            background: rgba(0, 0, 0, 0.9);
            border-color: rgba(255, 255, 255, 0.4);
          }
          
          .weather-control-btn.active {
            background: rgba(59, 130, 246, 0.8);
            border-color: rgba(59, 130, 246, 1);
          }
          
          /* Animasi spinner untuk loading */
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Custom marker styles */
          .weather-marker {
            background: rgba(59, 130, 246, 0.9);
            border: 2px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="weather-overlay">
            ${weatherContentHtml}
        </div>
        <div id="loading" class="loading-overlay">
          <div class="animate-spin" style="width: 20px; height: 20px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; margin: 0 auto 10px;"></div>
          Memuat peta cuaca...
        </div>
        
        <div class="weather-controls">
          <button class="weather-control-btn active" onclick="toggleWeatherLayer('clouds')" id="clouds-btn">
            ☁️ Awan
          </button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('precipitation')" id="precipitation-btn">
            🌧️ Hujan
          </button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('pressure')" id="pressure-btn">
            📊 Tekanan
          </button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('wind')" id="wind-btn">
            💨 Angin
          </button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('temp')" id="temp-btn">
            🌡️ Suhu
          </button>
        </div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          let map;
          let currentWeatherLayer = null;
          let weatherLayers = {};
          
          // OpenWeatherMap weather layers
          const weatherLayerConfigs = {
            clouds: {
              url: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}',
              name: 'Awan',
              opacity: 0.6
            },
            precipitation: {
              url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}',
              name: 'Presipitasi',
              opacity: 0.7
            },
            pressure: {
              url: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}',
              name: 'Tekanan',
              opacity: 0.6
            },
            wind: {
              url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}',
              name: 'Angin',
              opacity: 0.6
            },
            temp: {
              url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}',
              name: 'Suhu',
              opacity: 0.6
            }
          };
          
          function toggleWeatherLayer(layerType) {
            try {
              // Remove current weather layer
              if (currentWeatherLayer) {
                map.removeLayer(currentWeatherLayer);
                currentWeatherLayer = null;
              }
              
              // Update button states
              document.querySelectorAll('.weather-control-btn').forEach(btn => {
                btn.classList.remove('active');
              });
              
              // Add new weather layer if different from current
              if (weatherLayers[layerType]) {
                currentWeatherLayer = weatherLayers[layerType];
                map.addLayer(currentWeatherLayer);
                document.getElementById(layerType + '-btn').classList.add('active');
              } else if (weatherLayerConfigs[layerType]) {
                // Create new layer
                const config = weatherLayerConfigs[layerType];
                const layer = L.tileLayer(config.url, {
                  attribution: 'Weather data © OpenWeatherMap',
                  opacity: config.opacity,
                  maxZoom: 18
                });
                
                weatherLayers[layerType] = layer;
                currentWeatherLayer = layer;
                map.addLayer(layer);
                document.getElementById(layerType + '-btn').classList.add('active');
                
                console.log('Added weather layer:', layerType);
              }
            } catch(error) {
              console.error('Error toggling weather layer:', error);
            }
          }
          
          try {
            console.log('Initializing weather map...');
            document.getElementById('loading').style.display = 'block';
            
            // Initialize map
            map = L.map('map', {
              zoomControl: false,
              attributionControl: true
            }).setView([${lat}, ${lng}], ${zoom});
            
            // Add base tile layer
            const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            });
            
            baseLayer.on('load', function() {
              console.log('Base tiles loaded successfully');
              document.getElementById('loading').style.display = 'none';
            });
            
            baseLayer.on('tileerror', function(e) {
              console.error('Base tile loading error:', e);
            });
            
            baseLayer.addTo(map);
            
            // Add default clouds layer
            setTimeout(() => {
              toggleWeatherLayer('clouds');
            }, 1000);
            
            // Add location marker if coordinates are valid
            ${
              hasValidCoords
                ? `
                try {
                  // Custom weather marker
                  const weatherIcon = L.divIcon({
                    className: 'weather-marker',
                    html: '📍',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  });
                  
                  const marker = L.marker([${lat}, ${lng}], { icon: weatherIcon }).addTo(map);
                  
                  const popupContent = \`
                    <div style="text-align: center; padding: 10px;">
                      <h3 style="margin: 0 0 10px 0; color: #1e293b;">${locationName}</h3>
                      <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                        ${currentWeatherData ? `
                          <div style="font-size: 24px;">${currentWeatherData.icon.startsWith("01") ? "☀️" : currentWeatherData.icon.startsWith("09") || currentWeatherData.icon.startsWith("10") ? "🌧️" : currentWeatherData.icon.startsWith("11") ? "🌩️" : "☁️"}</div>
                          <div>
                            <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">${Math.round(currentWeatherData.temperature)}°C</div>
                            <div style="font-size: 12px; color: #64748b; text-transform: capitalize;">${currentWeatherData.description}</div>
                          </div>
                        ` : `
                          <div style="color: #64748b;">Data cuaca tidak tersedia</div>
                        `}
                      </div>
                      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
                        Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}
                      </div>
                    </div>
                  \`;
                  
                  marker.bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'weather-popup'
                  });
                  
                  console.log('Weather marker added successfully');
                } catch(markerError) {
                  console.error('Error adding weather marker:', markerError);
                }
                `
                : ""
            }
            
            // Invalidate size to ensure map renders correctly
            setTimeout(() => { 
              try {
                map.invalidateSize(); 
                console.log('Map size invalidated');
                document.getElementById('loading').style.display = 'none';
              } catch(sizeError) {
                console.error('Error invalidating map size:', sizeError);
              }
            }, 500);
            
            // Add zoom control to bottom right
            L.control.zoom({
              position: 'bottomleft'
            }).addTo(map);
            
            console.log('Weather map initialization completed');
            
          } catch(error) {
            console.error('Weather map initialization error:', error);
            document.getElementById('loading').innerHTML = 'Error memuat peta: ' + error.message;
          }
        </script>
      </body>
      </html>
    `;
  };

  // Convert HTML to data URL
  const htmlContent = generateIframeHtml();
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  return (
    <div
      className="w-full h-full min-h-[400px] rounded-lg border border-gray-700/30 relative overflow-hidden shadow-2xl"
      style={{ height: height }}
    >
      <iframe
        src={dataUrl}
        className="w-full h-full border-0 rounded-lg"
        title="Peta Cuaca dengan Overlay Awan dan Hujan"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => console.log('Weather iframe loaded successfully')}
        onError={(e) => console.error('Weather iframe loading error:', e)}
      />
    </div>
  );
}