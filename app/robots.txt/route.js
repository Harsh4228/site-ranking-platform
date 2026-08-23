export async function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /dashboard
Disallow: /setup

Sitemap: https://gosite.lol/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=86400" },
  });
}
