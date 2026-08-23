import mongoose from "mongoose";

const IndexSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Best Plumbers"
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    city: { type: String, required: true },
    sizeLimit: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export default mongoose.models.Index || mongoose.model("Index", IndexSchema);
