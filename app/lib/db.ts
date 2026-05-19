import 'dotenv/config'
import mongoose from "mongoose";

// Track connection state
let isConnected = false;

export async function dbConnect() {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }
``
  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("New database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}