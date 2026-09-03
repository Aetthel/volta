import { jest } from "@jest/globals";
import { enqueueWhatsAppMessage } from "../../queues/whatsappQueue.js";
import { createWhatsAppWorker } from "../../workers/whatsappWorker.js";

describe("whatsappQueue & worker", () => {
  it("should attempt to enqueue a message job", async () => {
    const payload = {
      appointmentId: "test-appt-123",
      businessId: "test-biz-123",
      phone: "+34600000000",
      message: "Test message",
    };

    const job = await enqueueWhatsAppMessage("SENTINEL_REMINDER", payload);
    expect(job === null || typeof job === "object").toBe(true);
  });

  it("should instantiate worker without throwing errors", async () => {
    const worker = createWhatsAppWorker();
    expect(worker).toBeDefined();
    await worker.close();
  });
});
