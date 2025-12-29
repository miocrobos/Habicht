/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'volleyball.ch',
      },
      {
        protocol: 'https',
        hostname: 'www.volleyball.ch',
      },
      {
        protocol: 'https',
        hostname: 'volleymanager.volleyball.ch',
      },
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'static.parastorage.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        // Allow all external images for club logos
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
  // Exclude backup and temp files from compilation
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('backup') && !ext.includes('_full') && !ext.includes('-new')),
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**', '**/*.backup.*', '**/*_full.*', '**/*-new.*', '**/*.bak'],
    }
    return config
  },
}

module.exports = nextConfig
