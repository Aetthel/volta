import { describe, it, expect } from "vitest";
import {
  buildLemonSqueezyCheckoutUrl,
  LEMON_SQUEEZY_PRODUCT_URLS,
} from "./lemonsqueezy";

describe("Lemon Squeezy URL Builder", () => {
  it("injects user_id and email as query parameters", () => {
    const url = buildLemonSqueezyCheckoutUrl(
      "https://volta.lemonsqueezy.com/buy/sample-product",
      {
        id: "user_12345",
        email: "usuario@ejemplo.com",
      }
    );

    expect(url).toContain("checkout%5Bcustom%5D%5Buser_id%5D=user_12345");
    expect(url).toContain("checkout%5Bemail%5D=usuario%40ejemplo.com");
  });

  it("handles only user_id when email is missing", () => {
    const url = buildLemonSqueezyCheckoutUrl(
      "https://volta.lemonsqueezy.com/buy/sample-product",
      {
        id: "user_12345",
      }
    );

    expect(url).toContain("checkout%5Bcustom%5D%5Buser_id%5D=user_12345");
    expect(url).not.toContain("checkout%5Bemail%5D");
  });

  it("returns base url when no user info is passed", () => {
    const url = buildLemonSqueezyCheckoutUrl(
      "https://volta.lemonsqueezy.com/buy/sample-product"
    );

    expect(url).toBe("https://volta.lemonsqueezy.com/buy/sample-product");
  });

  it("returns empty string when productUrl is empty", () => {
    const url = buildLemonSqueezyCheckoutUrl("");
    expect(url).toBe("");
  });

  it("has placeholder URLs defined for Basic and Pro plans", () => {
    expect(LEMON_SQUEEZY_PRODUCT_URLS.BASIC).toBeDefined();
    expect(LEMON_SQUEEZY_PRODUCT_URLS.PRO).toBeDefined();
  });
});
