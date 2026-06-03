/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "..",
  },
  serverExternalPackages: ["backend", "whatsapp-web.js"],
};

export default nextConfig;
