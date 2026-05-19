export type FeedItem = {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  [key: string]: unknown;
};

export type ApiFeedResponse = {
  success: boolean;
  data: FeedItem[];
  source?: "cache" | "database";
  error?: string;
};