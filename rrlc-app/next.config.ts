import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features to improve build stability and optimize react-icons
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  
  // Webpack configuration to handle react-icons properly
  webpack: (config) => {
    // Ensure proper module resolution for react-icons
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // Prevent issues with react-icons ESM/CJS interop
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };

    return config;
  },
};

export default nextConfig;
