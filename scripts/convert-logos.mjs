import { promises as fs } from "node:fs";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const logosDir = path.resolve(process.cwd(), "public", "logos");

const targets = [
  "shopify",
  "woocommerce",
  "bigcommerce",
  "magento",
  "prestashop",
  "opencart",
  "wix",
  "squarespace",
];

const width = 220;

async function main() {
  await fs.mkdir(logosDir, { recursive: true });

  for (const name of targets) {
    const svgPath = path.join(logosDir, `${name}.svg`);
    const pngPath = path.join(logosDir, `${name}.png`);

    const svg = await fs.readFile(svgPath, "utf8");

    // Force monochrome (premium grayscale) by using currentColor fill.
    // Many vendor SVGs have hardcoded fills; we keep them but apply CSS filter in UI.
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: width,
      },
      font: {
        loadSystemFonts: true,
      },
    });

    const rendered = resvg.render();
    const png = rendered.asPng();
    await fs.writeFile(pngPath, png);
    // eslint-disable-next-line no-console
    console.log(`✔ ${path.relative(process.cwd(), pngPath)}`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
