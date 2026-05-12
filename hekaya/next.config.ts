import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Tell Next.js that THIS project folder is the workspace root,
  // silencing the "multiple lockfiles" warning.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
