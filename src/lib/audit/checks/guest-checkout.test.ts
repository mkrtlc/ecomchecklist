import { describe, expect, it } from "vitest";
import { guestCheckoutCheck, __test__ } from "./guest-checkout";

describe("detectsGuestCheckoutOption", () => {
  it("detects 'guest checkout' text", () => {
    expect(__test__.detectsGuestCheckoutOption("<button>Guest Checkout</button>")).toBe(true);
  });

  it("detects 'continue as guest'", () => {
    expect(__test__.detectsGuestCheckoutOption("<a>Continue as guest</a>")).toBe(true);
  });

  it("detects forced account creation", () => {
    expect(__test__.detectsGuestCheckoutOption("<p>Create an account to continue</p>")).toBe(false);
  });

  it("returns null when unclear", () => {
    expect(__test__.detectsGuestCheckoutOption("<html><body>Shop</body></html>")).toBeNull();
  });
});

describe("guestCheckoutCheck", () => {
  it("warns when adapter missing", async () => {
    const r = await guestCheckoutCheck.run({ url: "https://example.com" }, {});
    expect(r.status).toBe("warn");
  });

  it("passes when guest checkout available", async () => {
    const r = await guestCheckoutCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ html: "<button>Checkout as guest</button>", finalUrl: "https://example.com/checkout" }),
        },
      }
    );
    expect(r.status).toBe("pass");
  });

  it("fails when forced account", async () => {
    const r = await guestCheckoutCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ html: "<p>Login required to checkout</p>" }),
        },
      }
    );
    expect(r.status).toBe("fail");
  });
});
