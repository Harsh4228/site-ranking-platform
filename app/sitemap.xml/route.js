import { connectDB } from "@/lib/db";
import Index from "@/models/Index";
import Listing from "@/models/Listing";

const BASE = process.env.NEXTAUTH_URL || "https://gosite.lol";

export async function GET() {
  await connectDB();
  const indexes = await Index.find().lean();
  const listings = await Listing.find().select("_id updatedAt").lean();

  const urls = [
    { loc: BASE, priority: "1.0" },
    { loc: `${BASE}/browse`, priority: "0.9" },
    { loc: `${BASE}/tools`, priority: "0.9" },
    { loc: `${BASE}/tools/bizlink`, priority: "0.9" },
    { loc: `${BASE}/tools/whatsapp-link`, priority: "0.9" },
    { loc: `${BASE}/tools/invoice`, priority: "0.8" },
    { loc: `${BASE}/tools/gst`, priority: "0.8" },
    { loc: `${BASE}/promote`, priority: "0.8" },
    { loc: `${BASE}/buy`, priority: "0.7" },
  ];

  const cities = [...new Set(indexes.map((i) => i.city))];
  const categories = [...new Set(indexes.map((i) => i.category))];
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  for (const city of cities) urls.push({ loc: `${BASE}/browse/city/${encodeURIComponent(city)}`, priority: "0.8" });
  for (const cat of categories) urls.push({ loc: `${BASE}/browse/category/${encodeURIComponent(cat)}`, priority: "0.8" });
  for (const cat of categories) for (const city of cities) urls.push({ loc: `${BASE}/best/${slug(cat)}/${slug(city)}`, priority: "0.85" });
  for (const idx of indexes) urls.push({ loc: `${BASE}/indexes/${idx.slug}`, priority: "0.8" });
  for (const l of listings) urls.push({ loc: `${BASE}/listings/${l._id}`, priority: "0.7" });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
}
