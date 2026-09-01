import { describe, it, expect } from "vitest";
import {
  COLOR_PALETTES,
  FONT_SCALES,
  RADIUS_SCALES,
  getThemeColor,
  getFontSizeLevel,
  getBorderRadiusLevel,
  parseThemeCookie,
  serializeThemeCookie,
  getThemeInlineStyles,
  getEffectiveInlineStyles,
  DEFAULT_THEME_PREFERENCES,
} from "./theme";

describe("Theme and Personalization Engine", () => {
  describe("getThemeColor", () => {
    it("returns default CLINICAL_ELEGANCE for null or undefined", () => {
      expect(getThemeColor(null)).toBe("CLINICAL_ELEGANCE");
      expect(getThemeColor(undefined)).toBe("CLINICAL_ELEGANCE");
      expect(getThemeColor("")).toBe("CLINICAL_ELEGANCE");
    });

    it("maps legacy color aliases properly", () => {
      expect(getThemeColor("TEAL")).toBe("CLINICAL_ELEGANCE");
      expect(getThemeColor("INDIGO")).toBe("CLINICAL_ELEGANCE");
      expect(getThemeColor("ROSE")).toBe("ORCHID_SERENITY");
      expect(getThemeColor("AMBER")).toBe("WARM_SAND");
      expect(getThemeColor("EMERALD")).toBe("ORGANIC_VITALITY");
    });

    it("accepts canonical palette keys", () => {
      expect(getThemeColor("CLINICAL_ELEGANCE")).toBe("CLINICAL_ELEGANCE");
      expect(getThemeColor("ORCHID_SERENITY")).toBe("ORCHID_SERENITY");
      expect(getThemeColor("ORGANIC_VITALITY")).toBe("ORGANIC_VITALITY");
      expect(getThemeColor("WARM_SAND")).toBe("WARM_SAND");
    });

    it("falls back to CLINICAL_ELEGANCE for unknown colors", () => {
      expect(getThemeColor("UNKNOWN_COLOR_XYZ")).toBe("CLINICAL_ELEGANCE");
    });
  });

  describe("getFontSizeLevel", () => {
    it("returns valid font size levels", () => {
      expect(getFontSizeLevel("SMALL")).toBe("SMALL");
      expect(getFontSizeLevel("MEDIUM")).toBe("MEDIUM");
      expect(getFontSizeLevel("LARGE")).toBe("LARGE");
    });

    it("handles lowercase inputs", () => {
      expect(getFontSizeLevel("small")).toBe("SMALL");
      expect(getFontSizeLevel("large")).toBe("LARGE");
    });

    it("falls back to MEDIUM for invalid or null inputs", () => {
      expect(getFontSizeLevel(null)).toBe("MEDIUM");
      expect(getFontSizeLevel(undefined)).toBe("MEDIUM");
      expect(getFontSizeLevel("HUGE")).toBe("MEDIUM");
    });
  });

  describe("getBorderRadiusLevel", () => {
    it("returns valid border radius levels", () => {
      expect(getBorderRadiusLevel("SMALL")).toBe("SMALL");
      expect(getBorderRadiusLevel("MEDIUM")).toBe("MEDIUM");
      expect(getBorderRadiusLevel("LARGE")).toBe("LARGE");
    });

    it("falls back to MEDIUM for invalid or null inputs", () => {
      expect(getBorderRadiusLevel(null)).toBe("MEDIUM");
      expect(getBorderRadiusLevel(undefined)).toBe("MEDIUM");
      expect(getBorderRadiusLevel("ROUND")).toBe("MEDIUM");
    });
  });

  describe("Cookie Parsing & Serialization", () => {
    it("parses valid encoded theme cookie", () => {
      const cookieVal = encodeURIComponent(
        JSON.stringify({
          themeColor: "ORCHID_SERENITY",
          fontSizeLevel: "LARGE",
          borderRadiusLevel: "SMALL",
        })
      );
      const parsed = parseThemeCookie(cookieVal);
      expect(parsed).toEqual({
        themeColor: "ORCHID_SERENITY",
        fontSizeLevel: "LARGE",
        borderRadiusLevel: "SMALL",
      });
    });

    it("handles shorthand cookie properties (theme, font, radius)", () => {
      const cookieVal = encodeURIComponent(
        JSON.stringify({
          theme: "WARM_SAND",
          font: "SMALL",
          radius: "LARGE",
        })
      );
      const parsed = parseThemeCookie(cookieVal);
      expect(parsed).toEqual({
        themeColor: "WARM_SAND",
        fontSizeLevel: "SMALL",
        borderRadiusLevel: "LARGE",
      });
    });

    it("safely falls back to defaults for malformed cookie strings", () => {
      expect(parseThemeCookie("invalid-json{")).toEqual(DEFAULT_THEME_PREFERENCES);
      expect(parseThemeCookie(null)).toEqual(DEFAULT_THEME_PREFERENCES);
      expect(parseThemeCookie(undefined)).toEqual(DEFAULT_THEME_PREFERENCES);
    });

    it("serializes theme preferences correctly", () => {
      const serialized = serializeThemeCookie({
        themeColor: "ORGANIC_VITALITY",
        fontSizeLevel: "LARGE",
        borderRadiusLevel: "SMALL",
      });
      const decoded = JSON.parse(decodeURIComponent(serialized));
      expect(decoded).toEqual({
        themeColor: "ORGANIC_VITALITY",
        fontSizeLevel: "LARGE",
        borderRadiusLevel: "SMALL",
      });
    });
  });

  describe("getThemeInlineStyles and getEffectiveInlineStyles", () => {
    it("generates CSS variables matching palette and scales", () => {
      const styles = getEffectiveInlineStyles({
        themeColor: "CLINICAL_ELEGANCE",
        fontSizeLevel: "MEDIUM",
        borderRadiusLevel: "MEDIUM",
      });

      expect(styles["--font-scale"]).toBe("1.0");
      expect(styles["--radius-scale"]).toBe("1.0");
      expect(styles["--color-primary"]).toBe(COLOR_PALETTES.CLINICAL_ELEGANCE.primary);
      expect(styles["--color-surface"]).toBe(COLOR_PALETTES.CLINICAL_ELEGANCE.surface);
      expect(styles["--color-on-surface"]).toBe(COLOR_PALETTES.CLINICAL_ELEGANCE.onSurface);
      expect(styles["--color-primary-container"]).toBe(
        COLOR_PALETTES.CLINICAL_ELEGANCE.primaryContainer
      );
    });
  });
});
