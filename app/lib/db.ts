import "dotenv/config";
import mongoose from "mongoose";

export async function dbConnect(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI — add it to your .env.local file"
    );
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("✅ New MongoDB connection established");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}