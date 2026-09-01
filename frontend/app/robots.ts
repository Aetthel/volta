import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://volta.aetthel.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/booking/", "/lopd/"],
        disallow: [
          "/admin/",
          "/inicio/",
          "/agenda/",
          "/clientes/",
          "/inbox/",
          "/ajustes/",
          "/equipo/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
