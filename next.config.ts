import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Expliziter Workspace-Root, da weitere Lockfiles außerhalb des Projekts liegen.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
