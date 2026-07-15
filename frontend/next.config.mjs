import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
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
  async headers() {
    return [
      {
        // Apply CSP headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
