import * as demoService from "../services/demoService.js";

export const createSandboxDemo = async (req, res) => {
  try {
    const demoData = await demoService.createDemo();
    return res.status(201).json({
      success: true,
      message: "Entorno de prueba creado exitosamente.",
      credentials: {
        email: demoData.email,
        password: demoData.password,
      },
      businessId: demoData.businessId,
      expiresAt: demoData.expiresAt,
    });
  } catch (error) {
    console.error("Error al crear entorno de prueba:", error);
    return res.status(500).json({ error: "No se pudo generar la demo efímera." });
  }
};

export const createDemo = createSandboxDemo;

export const deleteDemo = async (req, res) => {
  try {
    const businessId = req.user?.businessId || req.body?.businessId || req.query?.businessId;
    if (!businessId) {
      return res.status(400).json({ error: "Se requiere businessId para eliminar la demo." });
    }

    const deleted = await demoService.deleteDemo(businessId);
    if (!deleted) {
      return res.status(404).json({ error: "El entorno de prueba no existe o ya ha expirado." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Entorno de prueba finalizado y eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar entorno de prueba:", error);
    return res.status(500).json({ error: "No se pudo eliminar el entorno de prueba." });
  }
};
