
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(process.cwd(), "."),
        },
    },
    test: {
        environment: "node",
        include: ["**/*.{test,spec}.{ts,tsx}"],
        exclude: ["node_modules/**", ".next/**", "tests/e2e/**"],
        clearMocks: true,
    },
});
