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

    console.log("[API] Database initialization checks completed.");
  } catch (err) {
    console.error("[API] Error during database initialization:", err);
    throw err; // Propagate error so bootstrap sequence knows it failed
  }
}

export { ensureMockBusinessesExist };
