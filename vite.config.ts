import { unstable_vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import localesPlugin from "@react-aria/optimize-locales-plugin"

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    { ...localesPlugin.vite({ locales: [] }), enforce: "pre" },
  ],
})
