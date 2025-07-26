'use client';

import React from 'react';
import { WeatherData } from '@/lib/api';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';

interface WeatherMapIframeProps {
  selectedLocationCoords?: { lat: number; lng: number; name: string } | null;
  currentWeatherData?: WeatherData | null;
  loadingWeather?: boolean;
  weatherError?: string | null;
  height?: string;
}

export function WeatherMapIframe({
  selectedLocationCoords,
  currentWeatherData,
  loadingWeather,
  weatherError,
  height = '100%',
}: WeatherMapIframeProps) {
  /**
   * [OPTIMISASI]
   * Menggunakan React.useMemo untuk memoize (mengingat) hasil HTML.
   * Kode di dalamnya hanya akan dijalankan kembali jika salah satu dari
   * dependensi [selectedLocationCoords, currentWeatherData, dll.] berubah.
   * Ini secara signifikan meningkatkan performa dengan menghindari render ulang yang tidak perlu.
   */
  const dataUrl = React.useMemo(() => {
    // --- Variabel Dasar ---
    const lat = selectedLocationCoords?.lat || DEFAULT_MAP_CENTER[0];
    const lng = selectedLocationCoords?.lng || DEFAULT_MAP_CENTER[1];
    const zoom = selectedLocationCoords ? 12 : 5;
    const locationName = selectedLocationCoords?.name || 'Peta Indonesia';
    const hasValidCoords =
      selectedLocationCoords?.lat != null &&
      selectedLocationCoords?.lng != null;

    // --- Logika Konten Overlay Cuaca ---
    let weatherContentHtml = '';
    if (!hasValidCoords && selectedLocationCoords?.name) {
      weatherContentHtml = `<div class="status-overlay"><span>Koordinat tidak ditemukan untuk ${locationName}.</span></div>`;
    } else if (loadingWeather) {
      weatherContentHtml = `<div class="status-overlay loading"><div class="animate-spin"></div><span>Memuat cuaca...</span></div>`;
    } else if (weatherError) {
      weatherContentHtml = `<div class="status-overlay error"><span>Error: ${weatherError}</span></div>`;
    } else if (currentWeatherData) {
      const { icon, temperature, description } = currentWeatherData;
      // Perbaikan: Mendefinisikan displayTemperature dari variabel temperature
      const displayTemperature = `${Math.round(temperature)}°C`; // Contoh format, bisa disesuaikan

      let emoji = '☁️',
        bgColor = '#64748B',
        textColor = 'white';

      if (icon?.startsWith('01')) {
        emoji = icon === '01d' ? '☀️' : '🌙';
        bgColor = icon === '01d' ? '#FBBF24' : '#4F46E5';
        textColor = 'black';
      } else if (icon?.startsWith('02')) {
        emoji = '🌤️';
        bgColor = '#7DD3FC';
        textColor = 'black';
      } else if (icon?.startsWith('03') || icon?.startsWith('04')) {
        emoji = '☁️';
        bgColor = '#94A3B8';
      } else if (icon?.startsWith('09') || icon?.startsWith('10')) {
        emoji = '🌧️';
        bgColor = '#3B82F6';
      } else if (icon?.startsWith('11')) {
        emoji = '⛈️';
        bgColor = '#8B5CF6';
      } else if (icon?.startsWith('13')) {
        emoji = '🌨️';
        bgColor = '#A5F3FC';
        textColor = 'black';
      } else if (icon?.startsWith('50')) {
        emoji = '🌫️';
        bgColor = '#D1D5DB';
        textColor = 'black';
      }

      weatherContentHtml = `
        <div class="main-info">
          <div class="emoji-bg" style="background-color:${bgColor}; color:${textColor};">${emoji}</div>
          <div>
            <div class="temp">${displayTemperature}</div>
            <div class="desc">${description}</div>
          </div>
        </div>
        <div class="location-info">
          <div class="location-name">${locationName}</div>
          <div class="coords">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</div>
        </div>
      `;
    } else {
      weatherContentHtml = `<div class="status-overlay"><span>Pilih lokasi untuk melihat cuaca.</span></div>`;
    }

    // --- Template HTML Lengkap untuk Iframe ---
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <title>Peta Cuaca</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          /* CSS Reset & Body */
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1e293b; overflow: hidden; }
          #map { height: 100%; width: 100%; background: #334155; }
          .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.2) !important; }
          .leaflet-control-zoom a { background-color: rgba(0,0,0,0.7) !important; color: white !important; }
          .leaflet-control-zoom a:hover { background-color: rgba(0,0,0,0.9) !important; }
          .leaflet-bar { box-shadow: none !important; }

          /* Overlay Cuaca Atas */
          .weather-overlay { position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000; background: rgba(28, 37, 51, 0.8); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: white; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: space-between; gap: 10px; }
          .main-info { display: flex; align-items: center; gap: 14px; }
          .emoji-bg { font-size: 36px; width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
          .temp { font-size: 26px; font-weight: 600; color: white; }
          .desc { font-size: 13px; color: #cbd5e1; text-transform: capitalize; margin-top: -2px; }
          .location-info { text-align: right; }
          .location-name { font-weight: 600; color: white; }
          .coords { font-size: 11px; color: #94a3b8; }
          .status-overlay { width: 100%; text-align: center; color: #cbd5e1; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .status-overlay.error { color: #f87171; }
          
          /* Tombol Kontrol Layer */
          .weather-controls { position: absolute; bottom: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 6px; }
          .weather-control-btn { background: rgba(28, 37, 51, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; }
          .weather-control-btn:hover { background: rgba(0,0,0,0.9); border-color: rgba(255, 255, 255, 0.3); }
          .weather-control-btn.active { background: #3b82f6; border-color: #3b82f6; }
          
          /* Animasi & Ikon */
          .animate-spin { animation: spin 1s linear infinite; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="weather-overlay">${weatherContentHtml}</div>
        <div class="weather-controls">
          <button class="weather-control-btn" onclick="toggleWeatherLayer('clouds')">☁️ Awan</button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('precipitation')">🌧️ Hujan</button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('pressure')">📊 Tekanan</button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('wind')">💨 Angin</button>
          <button class="weather-control-btn" onclick="toggleWeatherLayer('temp')">🌡️ Suhu</button>
        </div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], ${zoom});
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20
          }).addTo(map);
          L.control.attribution({ position: 'bottomleft' }).addTo(map);
          L.control.zoom({ position: 'bottomright' }).addTo(map);

          let activeLayer;
          const layers = {};
          const layerConfigs = {
            clouds: { url: '/api/weather/tiles/clouds_new/{z}/{x}/{y}.png', opacity: 0.6 },
            precipitation: { url: '/api/weather/tiles/precipitation_new/{z}/{x}/{y}.png', opacity: 0.7 },
            pressure: { url: '/api/weather/tiles/pressure_new/{z}/{x}/{y}.png', opacity: 0.5 },
            wind: { url: '/api/weather/tiles/wind_new/{z}/{x}/{y}.png', opacity: 0.6 },
            temp: { url: '/api/weather/tiles/temp_new/{z}/{x}/{y}.png', opacity: 0.5 }
          };

          function toggleWeatherLayer(type) {
            if (activeLayer) map.removeLayer(activeLayer);
            document.querySelectorAll('.weather-control-btn').forEach(b => b.classList.remove('active'));
            
            if (!layers[type]) {
              const config = layerConfigs[type];
              if(config) {
                layers[type] = L.tileLayer(config.url, { opacity: config.opacity, maxZoom: 20 });
              }
            }
            activeLayer = layers[type];
            if(activeLayer) {
              map.addLayer(activeLayer);
              const activeBtn = document.querySelector('button[onclick*=\"' + type + '\"]');
              if(activeBtn) activeBtn.classList.add('active');
            }
          }
          toggleWeatherLayer('clouds'); // Set layer default
        </script>
      </body>
      </html>
    `;
    // Meng-encode seluruh HTML menjadi format data URL
    return `data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`;
  }, [
    selectedLocationCoords,
    currentWeatherData,
    loadingWeather,
    weatherError,
  ]);

  return (
    <div
      className="w-full h-full min-h-[400px] rounded-lg border border-slate-700/50 relative overflow-hidden bg-slate-800 shadow-lg"
      style={{ height: height }}
    >
      <iframe
        /**
         * [OPTIMISASI]
         * Menggunakan dataUrl sebagai `key` memastikan bahwa iframe akan
         * benar-benar di-render ulang oleh React hanya saat kontennya berubah.
         */
        key={dataUrl}
        src={dataUrl}
        className="w-full h-full border-0"
        title="Peta Cuaca Interaktif"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
