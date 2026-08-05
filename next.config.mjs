/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Next.js 16 auto-generates a CLAUDE.md for AI agents. On Windows' case-insensitive
  // filesystem this collides with and overwrites this project's existing Claude.md
  // (the AGNOS assignment instructions), so it must stay disabled.
  agentRules: false,
};

export default nextConfig;
