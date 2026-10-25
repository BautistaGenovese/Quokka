/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Solo Cloudinary: el servidor valida el mismo host antes de guardar imagen_url.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // Fotos de perfil de GitHub (GET /api/github/miembros)
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
