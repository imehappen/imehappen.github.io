/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Admin-manageable media may live on https CDNs; local files stay under /public.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
