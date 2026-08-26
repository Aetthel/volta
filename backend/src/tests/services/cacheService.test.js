import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { cacheService } from "../../services/cacheService.js";

describe("CacheService (Redis Caching Layer)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles get and returns null when redis is unavailable or key not found", async () => {
    const result = await cacheService.get("non-existent-key");
    expect(result).toBeNull();
  });

  it("handles set gracefully", async () => {
    const success = await cacheService.set("test-key", { name: "Test" }, 60);
    expect(typeof success).toBe("boolean");
  });

  it("handles del gracefully", async () => {
    const success = await cacheService.del("test-key");
    expect(typeof success).toBe("boolean");
  });

  it("handles invalidatePattern gracefully", async () => {
    const count = await cacheService.invalidatePattern("volta:cache:biz:123:*");
    expect(typeof count).toBe("number");
  });
});
