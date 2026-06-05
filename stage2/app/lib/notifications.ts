export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
  _read?: boolean;
  _priorityScore?: number;
  _rank?: number;
}

const API_URL = "http://4.224.186.213/evaluation-service/notifications";

// Auth headers from pre-test setup — replace with actual token
const AUTH_HEADERS: Record<string, string> = {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNTc0MzQ0LCJpYXQiOjE3NDM1NzQwNDQsImlzcyI6IkFmZm9yZGllZCIsImp0aSI6ImQ5Y2JiNjk5LTZhMjctNDRhNS04ZDU5LThi1MWJlZmE4MTZkYSIsInN1YiI6InJhbWltyaXNobmFAYWJjLmVkdSJ9LCJlbWFpbCI6InJhbWltyaXNobmFAYWJjLmVkdSIsInVzZXJJZCI6IjNvdmhPa0kyOUtySIsInJvbGVzIjpbImFhZG1pbiIsImlwIiwiWNjZXNzQ29kZSI6InhnQXNOQyIsImNsaWVudElEIjoiZDljYmI2OTktNmEyNy00NGE1LThkNTktOGIxYmVmYTgxNmRhIiwiY2xpZW50U2VjcmV0IjoiZFZFRhVkFJTZhTVZhVVFphlTSJ9.YApD98gq0IN_OWw7JMfmuUfK1m4hLTm7AIcLDcLAzVg",
};

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computePriorityScore(
  notification: Notification,
  oldestTs: number,
  newestTs: number
): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] ?? 0;
  const ts = new Date(notification.Timestamp).getTime();
  const range = newestTs - oldestTs;
  const recency = range > 0 ? (ts - oldestTs) / range : 1;
  return typeWeight * 10 + recency * 5;
}

export async function fetchNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<Notification[]> {
  const url = new URL(API_URL);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.notification_type) url.searchParams.set("notification_type", params.notification_type);

  const res = await fetch(url.toString(), {
    headers: AUTH_HEADERS,
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.notifications ?? [];
}

export async function fetchAllNotifications(): Promise<Notification[]> {
  const all: Notification[] = [];
  let page = 1;
  while (true) {
    const batch = await fetchNotifications({ limit: 100, page });
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return all;
}

export function getPriorityInbox(notifications: Notification[], topN: number = 10): Notification[] {
  if (!notifications.length) return [];

  const timestamps = notifications.map(n => new Date(n.Timestamp).getTime());
  const oldestTs = Math.min(...timestamps);
  const newestTs = Math.max(...timestamps);

  const scored = notifications.map(n => ({
    ...n,
    _priorityScore: computePriorityScore(n, oldestTs, newestTs),
  }));

  return scored
    .sort((a, b) => (b._priorityScore ?? 0) - (a._priorityScore ?? 0))
    .slice(0, topN)
    .map((n, i) => ({ ...n, _rank: i + 1 }));
}
