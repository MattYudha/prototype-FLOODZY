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

  
images: {
    remotePatterns: [
      { protocol:'https', hostname:'yqybhgqeejpdgffxzsno.supabase.co', pathname:'/storage/v1/object/public/**' },
    ],
    formats: ['image/avif','image/webp'],
  },
};

module.exports = nextConfig;
