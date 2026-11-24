import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Garante que o "motor" do Prisma (arquivo .node, gerado na instalação)
  // seja levado junto para o servidor da Vercel em todas as páginas.
  outputFileTracingIncludes: {
    "/**": ["./app/generated/prisma/**/*.node"],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
