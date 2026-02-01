import { describe, expect, it } from "vitest";
import { atcAboveFoldCheck, __test__ } from "./atc-above-fold";

describe("detectsAtcAboveFold", () => {
  it("detects ATC in early HTML", () => {
    const html = "<html><body><button>Add to Cart</button>" + "x".repeat(1000) + "</body></html>";
    expect(__test__.detectsAtcAboveFold(html)).toBe(true);
  });

  it("detects ATC below fold", () => {
    const html = "<html><body>" + "x".repeat(5000) + "<button>Add to Cart</button></body></html>";
    expect(__test__.detectsAtcAboveFold(html)).toBe(false);
  });

  it("returns null when no ATC found", () => {
    expect(__test__.detectsAtcAboveFold("<html><body>Product info</body></html>")).toBeNull();
  });
});

describe("atcAboveFoldCheck", () => {
  it("warns when adapter missing", async () => {
    const r = await atcAboveFoldCheck.run({ url: "https://example.com" }, {});
    expect(r.status).toBe("warn");
  });

  it("passes when ATC above fold", async () => {
    const r = await atcAboveFoldCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ 
            html: "<html><body><button class='add-to-cart'>Buy Now</button>" + "x".repeat(1000) + "</body></html>",
            finalUrl: "https://example.com/product" 
          }),
        },
      }
    );
    expect(r.status).toBe("pass");
  });

  it("fails when ATC below fold", async () => {
    const r = await atcAboveFoldCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ 
            html: "<html><body>" + "x".repeat(10000) + "<button>Add to Cart</button></body></html>" 
          }),
        },
      }
    );
    expect(r.status).toBe("fail");
  });
});
