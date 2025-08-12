import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración optimizada para Vercel
  typescript: {
    // Ignorar errores de TypeScript en build para producción
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignorar errores de ESLint en build para producción
    ignoreDuringBuilds: false,
  },
  // Optimización de imágenes
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Configuración de compresión
  compress: true,
  // Configuración de headers para seguridad y rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Configuración de rewrites para Socket.IO si es necesario
  async rewrites() {
    return [
      {
        source: '/api/socketio',
        destination: '/api/socketio',
      },
    ];
  },
  // Configuración para variables de entorno
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
