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
}

module.exports = nextConfig
