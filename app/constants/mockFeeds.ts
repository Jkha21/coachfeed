export interface FeedItem {
  _id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
}

export const MOCK_FEEDS: FeedItem[] = [
  {
    _id: "1",
    title: "Morning Standup Recap",
    body: "Team synced on sprint goals. Backend API routes are 80% done. Redis caching layer being tested today.",
    author: "Priya Sharma",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    _id: "2",
    title: "Design Review Complete",
    body: "All Figma components approved. Handoff to frontend starts now. Color tokens updated in the shared library.",
    author: "Marcus Lee",
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    _id: "3",
    title: "Redis Cache Layer — Live",
    body: "GET /feed now hits Redis first with a 30s TTL. Cache invalidates on every POST. Response time down to ~12ms.",
    author: "Ananya Iyer",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: "4",
    title: "Sprint 7 Kickoff",
    body: "New sprint starts Monday. Focus areas: WebSocket stability, error boundaries on frontend, and load testing the feed endpoint.",
    author: "Dev Kapoor",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];