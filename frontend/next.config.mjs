/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.QUOKKA_DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
  images: {
    // Solo Cloudinary: el servidor valida el mismo host antes de guardar imagen_url.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // Fotos de perfil de GitHub (GET /api/github/miembros)
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      // Google Identity `picture` claim (cuando el backend lo exponga en el usuario)
      { protocol: "https", hostname: "googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "**.googleusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
