import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error("Missing MONGODB_URI"); process.exit(1); }

const IndexSchema = new mongoose.Schema(
  { name: String, slug: String, category: String, city: String, sizeLimit: Number },
  { timestamps: true }
);
const ListingSchema = new mongoose.Schema({
  indexId: mongoose.Schema.Types.ObjectId, ownerId: mongoose.Schema.Types.ObjectId,
  name: String, description: String, whatsapp: String, phone: String,
  email: String, website: String, address: String, hours: String,
  verified: Boolean, avgRating: Number, reviewCount: Number,
  subscriptionActive: Boolean, subscriptionTier: Number,
  subscriptionExpiresAt: Date, recentLeadSpend: Number,
  trustScore: Number, visibilityScore: Number, rankScore: Number,
  views: Number, clicks: Number,
}, { timestamps: true });
const ReviewSchema = new mongoose.Schema({
  listingId: mongoose.Schema.Types.ObjectId, rating: Number,
  comment: String, ipHash: String,
}, { timestamps: true });

const Index = mongoose.models.Index || mongoose.model("Index", IndexSchema);
const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

function trust({ avgRating = 0, reviewCount = 0, verified = false }) {
  return Math.round(avgRating * 10 + Math.min(reviewCount, 50) * 0.6 + (verified ? 20 : 0));
}
function vis({ subscriptionActive, subscriptionTier = 0, recentLeadSpend = 0 }) {
  return Math.round((subscriptionActive ? subscriptionTier * 15 : 0) + Math.min(recentLeadSpend * 2, 60));
}

const INDEXES = [
  { name: "Best Plumbers", category: "Plumbing", city: "Mumbai", businesses: [
    { name: "Sharma Plumbing Works", desc: "24/7 emergency plumbing services for residential and commercial properties.", phone: "9876543210", verified: true, avgRating: 4.8, reviewCount: 47, sub: 3, leads: 22, address: "Shop 12, Andheri West, Mumbai 400053", hours: "Mon-Sat 8AM-9PM" },
    { name: "AquaFix Solutions", desc: "Pipe repair, water heater installation, drainage solutions.", phone: "9876543211", verified: true, avgRating: 4.6, reviewCount: 31, sub: 2, leads: 15, address: "Bandra East, Mumbai 400051", hours: "Mon-Sun 7AM-10PM" },
    { name: "QuickFlow Plumbers", desc: "Fast response plumbing for apartments and offices.", phone: "9876543212", verified: false, avgRating: 4.3, reviewCount: 18, sub: 1, leads: 8, address: "Malad West, Mumbai 400064", hours: "Mon-Sat 9AM-7PM" },
    { name: "PipeKing Services", desc: "Specializing in pipe fitting, bathroom renovation, and water tank cleaning.", phone: "9876543213", verified: true, avgRating: 4.1, reviewCount: 12, sub: 0, leads: 5, address: "Borivali East, Mumbai 400066", hours: "Mon-Fri 9AM-6PM" },
    { name: "Mumbai Drainage Experts", desc: "Blocked drain? We fix it in 30 minutes.", phone: "9876543214", verified: false, avgRating: 4.5, reviewCount: 8, sub: 0, leads: 3, address: "Dadar West, Mumbai 400028", hours: "24/7" },
  ]},
  { name: "Top Electricians", category: "Electrical", city: "Mumbai", businesses: [
    { name: "PowerGrid Electricals", desc: "Licensed electricians for wiring, MCB, inverter installation.", phone: "9876543220", verified: true, avgRating: 4.7, reviewCount: 38, sub: 4, leads: 30, address: "Powai, Mumbai 400076", hours: "Mon-Sun 8AM-9PM" },
    { name: "Volt Masters", desc: "Home and office electrical repairs, smart home setup.", phone: "9876543221", verified: true, avgRating: 4.4, reviewCount: 22, sub: 2, leads: 12, address: "Goregaon East, Mumbai 400063", hours: "Mon-Sat 9AM-8PM" },
    { name: "SafeWire Solutions", desc: "Complete electrical solutions — wiring, earthing, panel installation.", phone: "9876543222", verified: false, avgRating: 4.2, reviewCount: 15, sub: 0, leads: 7, address: "Kandivali West, Mumbai 400067", hours: "Mon-Sat 10AM-7PM" },
    { name: "Spark Electrical Co", desc: "Affordable electrical repairs and new installations.", phone: "9876543223", verified: false, avgRating: 3.9, reviewCount: 9, sub: 1, leads: 4, address: "Andheri East, Mumbai 400069", hours: "Mon-Fri 9AM-6PM" },
  ]},
  { name: "Best Dentists", category: "Healthcare", city: "Ahmedabad", businesses: [
    { name: "SmileCare Dental Clinic", desc: "Advanced dental care — RCT, braces, implants, whitening.", phone: "9876543230", verified: true, avgRating: 4.9, reviewCount: 62, sub: 4, leads: 45, address: "CG Road, Ahmedabad 380006", hours: "Mon-Sat 9AM-8PM" },
    { name: "DentPro Multi-Specialty", desc: "All dental treatments under one roof. 15+ years experience.", phone: "9876543231", verified: true, avgRating: 4.7, reviewCount: 41, sub: 3, leads: 28, address: "Satellite, Ahmedabad 380015", hours: "Mon-Sun 10AM-9PM" },
    { name: "Pearl Dental Studio", desc: "Cosmetic dentistry, teeth alignment, pediatric dental care.", phone: "9876543232", verified: true, avgRating: 4.5, reviewCount: 25, sub: 1, leads: 10, address: "Prahladnagar, Ahmedabad 380015", hours: "Mon-Sat 9:30AM-7PM" },
    { name: "Healthy Teeth Clinic", desc: "Affordable dental treatments for the whole family.", phone: "9876543233", verified: false, avgRating: 4.3, reviewCount: 14, sub: 0, leads: 6, address: "Maninagar, Ahmedabad 380008", hours: "Tue-Sun 10AM-6PM" },
    { name: "Dr. Patel Dental Care", desc: "Experienced dentist specializing in root canals and crowns.", phone: "9876543234", verified: false, avgRating: 4.0, reviewCount: 7, sub: 0, leads: 2, address: "Navrangpura, Ahmedabad 380009", hours: "Mon-Fri 10AM-5PM" },
  ]},
  { name: "Top Interior Designers", category: "Interior Design", city: "Bangalore", businesses: [
    { name: "UrbanNest Interiors", desc: "Modern home and office interiors. 3D visualization included.", phone: "9876543240", verified: true, avgRating: 4.8, reviewCount: 35, sub: 4, leads: 20, address: "Koramangala, Bangalore 560034", hours: "Mon-Sat 10AM-7PM" },
    { name: "Livspace Studio", desc: "End-to-end interior design with modular kitchens and wardrobes.", phone: "9876543241", verified: true, avgRating: 4.6, reviewCount: 28, sub: 3, leads: 18, address: "Indiranagar, Bangalore 560038", hours: "Mon-Sun 10AM-8PM" },
    { name: "SpaceWood Creations", desc: "Custom furniture and turnkey interior solutions.", phone: "9876543242", verified: false, avgRating: 4.4, reviewCount: 16, sub: 1, leads: 9, address: "Whitefield, Bangalore 560066", hours: "Mon-Sat 9AM-6PM" },
    { name: "DecorArt Studio", desc: "Budget-friendly interiors for apartments and villas.", phone: "9876543243", verified: false, avgRating: 4.1, reviewCount: 10, sub: 0, leads: 4, address: "HSR Layout, Bangalore 560102", hours: "Mon-Fri 10AM-6PM" },
  ]},
  { name: "Best Packers & Movers", category: "Logistics", city: "Delhi", businesses: [
    { name: "SafeShift Packers", desc: "Reliable household and office shifting across India. Insurance included.", phone: "9876543250", verified: true, avgRating: 4.7, reviewCount: 52, sub: 4, leads: 35, address: "Karol Bagh, New Delhi 110005", hours: "Mon-Sun 7AM-10PM" },
    { name: "EasyMove Logistics", desc: "Professional packing, loading, unloading, and unpacking services.", phone: "9876543251", verified: true, avgRating: 4.5, reviewCount: 33, sub: 2, leads: 20, address: "Lajpat Nagar, New Delhi 110024", hours: "Mon-Sat 8AM-8PM" },
    { name: "SwiftPack Movers", desc: "Local and inter-city moving at affordable rates.", phone: "9876543252", verified: false, avgRating: 4.2, reviewCount: 19, sub: 1, leads: 11, address: "Dwarka Sector 12, New Delhi 110078", hours: "Mon-Sun 8AM-9PM" },
    { name: "Metro Relocations", desc: "Corporate relocation specialists. Vehicle transport available.", phone: "9876543253", verified: false, avgRating: 3.8, reviewCount: 8, sub: 0, leads: 3, address: "Rohini, New Delhi 110085", hours: "Mon-Fri 9AM-6PM" },
  ]},
  { name: "Top Wedding Planners", category: "Events", city: "Delhi", businesses: [
    { name: "DreamDay Weddings", desc: "Luxury wedding planning — venue, decor, catering, photography.", phone: "9876543260", verified: true, avgRating: 4.9, reviewCount: 44, sub: 4, leads: 28, address: "Connaught Place, New Delhi 110001", hours: "Mon-Sat 10AM-8PM" },
    { name: "Royal Events Co", desc: "Grand destination weddings and intimate ceremonies.", phone: "9876543261", verified: true, avgRating: 4.6, reviewCount: 29, sub: 3, leads: 16, address: "Hauz Khas, New Delhi 110016", hours: "Mon-Sun 9AM-9PM" },
    { name: "BlissWed Planners", desc: "Budget-friendly wedding coordination and vendor management.", phone: "9876543262", verified: false, avgRating: 4.3, reviewCount: 17, sub: 1, leads: 8, address: "Rajouri Garden, New Delhi 110027", hours: "Mon-Sat 10AM-7PM" },
  ]},
  { name: "Best Restaurants", category: "Food & Dining", city: "Pune", businesses: [
    { name: "Spice Junction", desc: "Authentic North Indian and Mughlai cuisine. Family dining.", phone: "9876543270", verified: true, avgRating: 4.7, reviewCount: 68, sub: 3, leads: 40, address: "FC Road, Pune 411004", hours: "11AM-11PM daily" },
    { name: "Green Leaf Veg", desc: "Pure vegetarian restaurant with Gujarati and Rajasthani thali.", phone: "9876543271", verified: true, avgRating: 4.5, reviewCount: 42, sub: 2, leads: 25, address: "Koregaon Park, Pune 411001", hours: "11:30AM-10:30PM daily" },
    { name: "Sizzle & Grill", desc: "Sizzlers, steaks, and continental. Rooftop dining available.", phone: "9876543272", verified: false, avgRating: 4.4, reviewCount: 31, sub: 1, leads: 15, address: "Viman Nagar, Pune 411014", hours: "12PM-11PM daily" },
    { name: "Chai & Bites Cafe", desc: "Cafe with specialty chai, snacks, and fast WiFi.", phone: "9876543273", verified: false, avgRating: 4.2, reviewCount: 20, sub: 0, leads: 8, address: "Hinjewadi, Pune 411057", hours: "8AM-10PM daily" },
    { name: "Maharaja Thali House", desc: "Unlimited thali for lunch and dinner. Veg and non-veg options.", phone: "9876543274", verified: false, avgRating: 4.0, reviewCount: 12, sub: 0, leads: 3, address: "Kothrud, Pune 411038", hours: "11AM-3PM, 7PM-10:30PM" },
  ]},
  { name: "Best CA Firms", category: "Finance", city: "Ahmedabad", businesses: [
    { name: "TaxPro Associates", desc: "ITR filing, GST registration, audit, and business consultation.", phone: "9876543280", verified: true, avgRating: 4.8, reviewCount: 36, sub: 4, leads: 22, address: "Ashram Road, Ahmedabad 380009", hours: "Mon-Sat 10AM-7PM" },
    { name: "FinEdge Chartered", desc: "Complete accounting, tax planning, and company registration.", phone: "9876543281", verified: true, avgRating: 4.5, reviewCount: 24, sub: 2, leads: 14, address: "SG Highway, Ahmedabad 380054", hours: "Mon-Fri 9:30AM-6:30PM" },
    { name: "LedgerWise CA", desc: "Startup-friendly CA firm. Compliance, payroll, and bookkeeping.", phone: "9876543282", verified: false, avgRating: 4.3, reviewCount: 15, sub: 0, leads: 7, address: "Bodakdev, Ahmedabad 380054", hours: "Mon-Sat 10AM-6PM" },
  ]},
];

const REVIEW_COMMENTS = [
  "Great service, very professional!",
  "Came on time and did excellent work.",
  "Very satisfied with the quality. Will recommend.",
  "Good experience overall. Reasonable pricing.",
  "Highly skilled team. Fixed the issue quickly.",
  "Decent service but a bit expensive.",
  "Very responsive and helpful.",
  "Best in the area. Trust them completely.",
  "Average experience. Room for improvement.",
  "Fantastic work! Five stars deserved.",
  "Quick and reliable. Used them twice now.",
  "Professional behavior. Clean work.",
];

async function main() {
  await mongoose.connect(MONGODB_URI);

  // Clean existing data
  await Index.deleteMany({});
  await Listing.deleteMany({});
  await Review.deleteMany({});

  let totalListings = 0;
  let totalReviews = 0;

  for (const idx of INDEXES) {
    const slug = `${idx.name}-${idx.city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const index = await Index.create({
      name: idx.name,
      slug,
      category: idx.category,
      city: idx.city,
      sizeLimit: 20,
    });

    for (const biz of idx.businesses) {
      const subActive = biz.sub > 0;
      const t = trust({ avgRating: biz.avgRating, reviewCount: biz.reviewCount, verified: biz.verified });
      const v = vis({ subscriptionActive: subActive, subscriptionTier: biz.sub, recentLeadSpend: biz.leads });

      const listing = await Listing.create({
        indexId: index._id,
        name: biz.name,
        description: biz.desc,
        phone: biz.phone,
        whatsapp: "91" + biz.phone,
        email: biz.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@gmail.com",
        website: "",
        address: biz.address,
        hours: biz.hours,
        verified: biz.verified || false,
        avgRating: biz.avgRating || 0,
        reviewCount: biz.reviewCount || 0,
        subscriptionActive: subActive,
        subscriptionTier: biz.sub || 0,
        subscriptionExpiresAt: subActive ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        recentLeadSpend: biz.leads || 0,
        trustScore: t,
        visibilityScore: v,
        rankScore: t + v,
        views: Math.floor(Math.random() * 500) + 50,
        clicks: Math.floor(Math.random() * 80) + 5,
      });

      // Create reviews
      for (let i = 0; i < Math.min(biz.reviewCount || 0, 12); i++) {
        await Review.create({
          listingId: listing._id,
          rating: Math.max(1, Math.min(5, Math.round(biz.avgRating + (Math.random() - 0.5)))),
          comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
          ipHash: `seed-${i}-${listing._id}`,
        });
        totalReviews++;
      }

      totalListings++;
    }

    console.log(`✓ Created "${idx.name}" in ${idx.city} with ${idx.businesses.length} businesses`);
  }

  console.log(`\nSeed complete: ${INDEXES.length} indexes, ${totalListings} listings, ${totalReviews} reviews.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
