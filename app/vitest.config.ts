import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: false,
    include: ["__tests__/**/*.{test,spec}.ts"],
    exclude: ["__tests__/helpers/**"],
    environment: "node",
  },
});
