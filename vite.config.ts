import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
  uild: {
    rollupOptions: {
      external: [
        "@libsql/client",
        "@libsql/client/node",
        "@libsql/linux-x64-gnu",
        "libsql",
      ],
    },
  },
  ssr: {
    external: [
      "@libsql/client",
      "@libsql/client/node",
      "@libsql/linux-x64-gnu",
      "libsql",
    ],
  },
});
