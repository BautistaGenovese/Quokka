/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Solo Cloudinary: el servidor valida el mismo host antes de guardar imagen_url.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
  },
};

export default nextConfig;
