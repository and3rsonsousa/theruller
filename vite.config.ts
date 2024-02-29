import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import { vercelServerlessPreset } from "@resolid/remix-plugins/vercel-serverless"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"

export default defineConfig({
  plugins: [
    remix(),
    vanillaExtractPlugin(),
    vercelServerlessPreset({
      regions: "sin1",
      cleanUrls: true,
      cacheFiles: [
        "favicon.svg",
        "apple-touch-icon.png",
        "manifest.webmanifest",
      ],
      cacheFolders: ["icons", "images"],
    }),
    tsconfigPaths(),
    { ...localesPlugin.vite({ locales: [] }), enforce: "pre" },
  ],
})
