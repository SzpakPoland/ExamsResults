/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing code...
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://162.19.246.158:3001/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig