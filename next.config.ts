import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['net'],
  turbopack: {},
  webpack: (config) => {
    // Windows 上 readlink 对普通文件返回 EISDIR 的 bug
    // 关闭 symlink 解析 + 关闭 filesystem cache（快照时也会调 readlink）
    config.resolve.symlinks = false;
    config.cache = false;
    return config;
  },
};

export default nextConfig;
