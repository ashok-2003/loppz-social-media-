/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Allow HTTP images
        hostname: '**', // Allows any hostname
        port: '',
        pathname: '**', // Allows any path
      },
      {
        protocol: 'https', // Allow HTTPS images
        hostname: '**', // Allows any hostname
        port: '',
        pathname: '**', // Allows any path
      },
    ],
  },
};

module.exports = nextConfig;
