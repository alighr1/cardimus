import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // self-contained server folder, easy to upload and run with Node
  poweredByHeader: false,
  // Lets a phone on the same Wi‑Fi load the dev server (comma-separated LAN IPs/hosts in DEV_ORIGINS).
  allowedDevOrigins: (process.env.DEV_ORIGINS ?? "192.168.1.24").split(",").map((s) => s.trim()),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
