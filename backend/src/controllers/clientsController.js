import * as clientsService from "../services/clientsService.js";
import { ApiResponse } from "../utils/index.js";

export const getClients = async (req, res) => {
  const { businessId } = req.query;

  // Verify tenant isolation
  if (req.user.role !== "ADMIN" && businessId !== req.user.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const clients = await clientsService.getClientsByBusiness(businessId);
  return ApiResponse.success(res, clients);
};

export const createClient = async (req, res) => {
  const { name, surname, email, phone, businessId } = req.body;

  // Verify tenant isolation
  if (req.user.role !== "ADMIN" && businessId !== req.user.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este negocio" });
  }

  const client = await clientsService.createClient({ name, surname, email, phone, businessId });
  return ApiResponse.created(res, client);
};

export const updateClient = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== "ADMIN") {
    const client = await clientsService.getClientById(id);
    if (!client || client.businessId !== req.user.businessId) {
      return res.status(403).json({ error: "Acceso denegado a este cliente" });
    }
  }

  const { name, surname, email, phone, lastVisit, frequentService } = req.body;
  const client = await clientsService.updateClient(id, {
    name,
    surname,
    email,
    phone,
    lastVisit,
    frequentService,
  });
  return ApiResponse.success(res, client);
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;

  // Verify tenant isolation
  if (req.user.role !== "ADMIN") {
    const client = await clientsService.getClientById(id);
    if (!client || client.businessId !== req.user.businessId) {
      return res.status(403).json({ error: "Acceso denegado a este cliente" });
    }
  }

  await clientsService.deleteClient(id);
  return ApiResponse.deleted(res);
};

export const resendConsent = async (req, res) => {
  const { id } = req.params;

  const client = await clientsService.getClientById(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // Verify tenant isolation
  if (req.user.role !== "ADMIN" && client.businessId !== req.user.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este cliente" });
  }

  // Un rechazo expreso no se puede sortear reenviando la solicitud desde el panel.
  if (client.lopdStatus === "Rechazado") {
    return res.status(409).json({
      error:
        "Este cliente rechazó expresamente el consentimiento. No se le puede reenviar la solicitud.",
      code: "LOPD_REJECTED",
    });
  }

  await clientsService.resendConsent(client);
  return ApiResponse.ok(res);
};

export const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "El campo message es requerido y no puede estar vacío." });
  }

  const client = await clientsService.getClientById(id);
  if (!client) {
    return res.status(404).json({ error: "Cliente no encontrado" });
  }

  // Verify tenant isolation
  if (req.user.role !== "ADMIN" && client.businessId !== req.user.businessId) {
    return res.status(403).json({ error: "Acceso denegado a este cliente" });
  }

  await clientsService.sendMessage(client, message);
  return ApiResponse.ok(res);
};
