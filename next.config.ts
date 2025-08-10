import type { NextConfig } from "next";

// Configuration du bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Optimisations de performance
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    // Optimisations avancées
    optimizePackageImports: [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      'date-fns',
      'zod',
      'stripe',
      'openai'
    ],
    // Optimisation des images
    images: {
      allowFutureImage: true,
    },
  },
  
  // Configuration webpack optimisée
  webpack(config, { dev, isServer }) {
    // Configuration SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Optimisations de production
    if (!dev && !isServer) {
      // Tree shaking agressif
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // FontAwesome chunk séparé
            fontawesome: {
              test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
              name: 'fontawesome',
              chunks: 'all',
              priority: 20,
            },
            // Stripe chunk séparé
            stripe: {
              test: /[\\/]node_modules[\\/]stripe[\\/]/,
              name: 'stripe',
              chunks: 'all',
              priority: 20,
            },
            // OpenAI chunk séparé
            openai: {
              test: /[\\/]node_modules[\\/]openai[\\/]/,
              name: 'openai',
              chunks: 'all',
              priority: 20,
            },
            // Common chunks
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Optimisations des images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Optimisations de compression
  compress: true,
  
  // Optimisations de cache
  generateEtags: false,
  
  // Variables d'environnement
  env: {
    PORT: "4001",
  },

  // Headers de sécurité et performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Cache headers pour les assets statiques
          {
            source: '/static/(.*)',
            headers: [
              {
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable',
              },
            ],
          },
        ],
      },
    ];
  },

  // Optimisations de redirection
  async redirects() {
    return [
      // Redirections pour optimiser les performances
      {
        source: '/favicon.ico',
        destination: '/favicon.ico',
        permanent: true,
      },
    ];
  },
};

// Export avec bundle analyzer conditionnel
export default withBundleAnalyzer(nextConfig);
