/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bypass Webpack bundling for PDF libraries to fix Vercel dynamic import errors
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
