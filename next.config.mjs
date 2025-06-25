/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    formats: ['image/webp', 'image/avif'],
  },
  transpilePackages: ['framer-motion'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
}

export default nextConfig
