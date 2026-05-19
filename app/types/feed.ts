// app/types/feed.ts
export type FeedItem = {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string; // or Date if you convert in client
  [key: string]: unknown;
};

export type ApiFeedResponse = {
  success: boolean;
  data: FeedItem[];
  source?: "cache" | "database";
  error?: string;
};