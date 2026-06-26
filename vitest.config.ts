import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/lib/test-utils/setup.ts"],
    css: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
