import mongoose from "mongoose";

const PageViewSchema = new mongoose.Schema({
  path: { type: String, required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
});

PageViewSchema.index({ path: 1, date: 1 }, { unique: true });

export default mongoose.models.PageView || mongoose.model("PageView", PageViewSchema);
