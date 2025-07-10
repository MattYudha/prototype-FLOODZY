// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pastikan Anda TIDAK memiliki 'output: "export"' di sini
  // Jika ada, hapus baris 'output: "export",'

  webpack: (config, { isServer }) => {
    // Konfigurasi ini hanya berlaku untuk build sisi server,
    // untuk memberitahu Webpack agar tidak mencoba membundel modul native Node.js
    if (isServer) {
      config.externals.push("bufferutil", "utf-8-validate");
    }
    return config;
  },
};

module.exports = nextConfig;
