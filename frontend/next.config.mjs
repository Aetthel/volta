/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: "..",
  },
  serverExternalPackages: ["backend", "whatsapp-web.js"],
  // Allow external origins to connect to the Next.js dev server HMR WebSocket.
  // Required when using Cloudflare Tunnel or accessing from a different device
  // on the local network — otherwise Next.js rejects the WebSocket with "Unauthorized".
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "192.168.*",
    "10.*",
    "172.*",
  ],
};

export default nextConfig;
