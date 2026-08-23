import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    indexId: { type: mongoose.Schema.Types.ObjectId, ref: "Index", required: true },
    author: { type: String, required: true, maxlength: 60 },
    body: { type: String, required: true, maxlength: 500 },
    ipHash: { type: String, required: true },
  },
  { timestamps: true }
);

MessageSchema.index({ indexId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
