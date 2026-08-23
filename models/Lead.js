import mongoose from "mongoose";

// One row per "Contact via WhatsApp" click that a business pays for (Path B pricing).
const LeadSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    cost: { type: Number, required: true, min: 0 }, // price charged for this lead
    source: { type: String, default: "whatsapp" },
    ipHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
