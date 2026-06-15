import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET || "http://localhost:8080";

const nextConfig: NextConfig = {
    output: "standalone",
    async rewrites() {
        return [
            {
                source: "/api/v1/:path*",
                destination: `${apiProxyTarget}/api/v1/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "algotutor-s3-bucket-390844772264-ap-southeast-2-an.s3.ap-southeast-2.amazonaws.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
