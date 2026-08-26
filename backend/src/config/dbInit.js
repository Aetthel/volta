import prisma from "./db.js";
import bcrypt from "bcryptjs";

/**
 * Ensures that mock businesses, admin, jefe, and employee users exist in the database,
 * and seeds example clients and appointments for local demonstration.
 */
async function ensureMockBusinessesExist() {
  try {
    // Admin initialization via environment variables
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (initialAdminEmail && initialAdminPassword) {
      const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (!existingAdmin) {
        console.log("[dbInit] No admin found. Creating initial admin.");
        const hashedAdminPass = await bcrypt.hash(initialAdminPassword, 10);
        await prisma.user.create({
          data: {
            name: "Admin Principal",
            email: initialAdminEmail,
            password: hashedAdminPass,
            role: "ADMIN",
          },
        });
      } else {
        console.log("[dbInit] Admin user already exists. Skipping initial admin creation.");
      }
    } else {
      console.log(
        "[dbInit] INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD not set. No default admin will be created."
      );
    }

    // If database has 0 businesses, create a default demonstration business
    const businessCount = await prisma.business.count();
    if (businessCount === 0) {
      console.log("[dbInit] No business found in database. Seeding default demo business...");
      const demoBusiness = await prisma.business.create({
        data: {
          name: "Volta Hair Studio",
          phone: "34600000000",
          email: "contacto@voltastudio.es",
          businessType: "Peluquería / Barbería",
          description: "Estudio de peluquería y estética integral de alto rendimiento.",
          subscriptionPlan: "PRO",
          subscriptionStatus: "TRIALING",
          trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          services: {
            create: [
              { name: "Corte Caballero", price: 35, duration: 30, color: "TEAL" },
              { name: "Corte Dama", price: 45, duration: 45, color: "ROSE" },
              { name: "Coloración Premium", price: 85, duration: 90, color: "PURPLE" },
              { name: "Tratamiento Keratina", price: 50, duration: 60, color: "AMBER" },
              { name: "Manicura", price: 20, duration: 30, color: "EMERALD" },
              { name: "Spa Facial", price: 40, duration: 45, color: "SKY" },
            ],
          },
        },
      });

      const demoPasswordHash = await bcrypt.hash("demo1234", 10);
      await prisma.user.create({
        data: {
          name: "Jefe Volta",
          email: "jefe@volta.es",
          password: demoPasswordHash,
          role: "JEFE",
          businessId: demoBusiness.id,
        },
      });
      console.log(`[dbInit] Demo business and user created successfully (ID: ${demoBusiness.id})`);
    }

    console.log("[API] Database initialization checks completed.");
  } catch (err) {
    console.error("[API] Error during database initialization:", err);
    throw err; // Propagate error so bootstrap sequence knows it failed
  }
}

export { ensureMockBusinessesExist };
