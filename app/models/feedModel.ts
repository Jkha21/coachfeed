// models/postModel.ts
import mongoose, { Schema, Model } from "mongoose";
import { IPost } from "@/interface/IPost";

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
PostSchema.index({ createdAt: -1 });               // for feed: latest posts first
PostSchema.index({ author: 1, createdAt: -1 });    // for user-specific posts

const postModel: Model<IPost> =
  mongoose.models.postModel || mongoose.model<IPost>("postModel", PostSchema);

export default postModel;