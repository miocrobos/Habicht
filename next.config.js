/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'volleyball.ch',
      'www.volleyball.ch',
      'i.ytimg.com',
      'img.youtube.com',
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
