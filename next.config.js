// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi Webpack yang sudah ada
  webpack: (config, { isServer }) => {
    // Konfigurasi ini hanya berlaku untuk build sisi server,
    // untuk memberitahu Webpack agar tidak mencoba membundel modul native Node.js
    if (isServer) {
      config.externals.push('bufferutil', 'utf-8-validate');
    }
    return config;
  },

  // PENAMBAHAN UNTUK OPENTELEMETRY
  // Beritahu Next.js untuk menggunakan file instrumentation.ts saat server dimulai
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
