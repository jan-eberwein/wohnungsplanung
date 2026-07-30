import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Expliziter Workspace-Root, da weitere Lockfiles außerhalb des Projekts liegen.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Foto-Uploads laufen über Server Actions; das Default-Limit von 1 MB
    // reicht für Handyfotos nicht. Fotos werden zwar client-seitig verkleinert,
    // dieses Limit ist der Sicherheitspuffer (mehrere Fotos, Fallback-Fälle).
    serverActions: {
      bodySizeLimit: "20mb",
    },
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
