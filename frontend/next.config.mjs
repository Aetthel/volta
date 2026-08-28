import path from "path";

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  serverExternalPackages: ["backend"],
  // Allow external origins to connect to the Next.js dev server HMR WebSocket.
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
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
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.lemonsqueezy.com"
                : "script-src 'self' 'unsafe-inline' https://assets.lemonsqueezy.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              isDev
                ? "connect-src * 'self' ws: wss: http: https:"
                : "connect-src 'self' https://*.lemonsqueezy.com https://assets.lemonsqueezy.com ws: wss:",
              "frame-src 'self' https://assets.lemonsqueezy.com https://*.lemonsqueezy.com",
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
