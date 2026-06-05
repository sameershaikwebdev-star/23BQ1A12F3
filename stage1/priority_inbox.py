"""
Stage 1 - Campus Notifications Priority Inbox
AffordMed Campus Hiring Evaluation

Priority scoring:
  - Type weight:   Placement=3, Result=2, Event=1
  - Recency score: newer notifications score higher (normalized 0–1)
  - Final score:   type_weight * 10 + recency_score * 5  (weights tunable)
"""

import requests
from datetime import datetime, timezone
from typing import Optional


# ---------------------------------------------------------------------------
# Logging Middleware stub
# Replace this import with your actual logging middleware from pre-test setup
# ---------------------------------------------------------------------------
class Logger:
    """Minimal stand-in for the Logging Middleware from pre-test setup."""
    def info(self, msg: str):  print(f"[INFO]  {msg}")
    def error(self, msg: str): print(f"[ERROR] {msg}")

logger = Logger()


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
API_URL = "http://4.224.186.213/evaluation-service/notifications"

# ---------------------------------------------------------------------------
# Auth — set your token from the pre-test setup here
# ---------------------------------------------------------------------------
# Replace with the actual token/header provided in your pre-test setup
AUTH_HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNTc0MzQ0LCJpYXQiOjE3NDM1NzQwNDQsImlzcyI6IkFmZm9yZGllZCIsImp0aSI6ImQ5Y2JiNjk5LTZhMjctNDRhNS04ZDU5LThi1MWJlZmE4MTZkYSIsInN1YiI6InJhbWltyaXNobmFAYWJjLmVkdSJ9LCJlbWFpbCI6InJhbWltyaXNobmFAYWJjLmVkdSIsInVzZXJJZCI6IjNvdmhPa0kyOUtySIsInJvbGVzIjpbImFhZG1pbiIsImlwIiwiWNjZXNzQ29kZSI6InhnQXNOQyIsImNsaWVudElEIjoiZDljYmI2OTktNmEyNy00NGE1LThkNTktOGIxYmVmYTgxNmRhIiwiY2xpZW50U2VjcmV0IjoiZFZFRhVkFJTZhTVZhVVFphlTSJ9.YApD98gq0IN_OWw7JMfmuUfK1m4hLTm7AIcLDcLAzVg",

    # "x-api-key": "<your_key_here>",
}

TYPE_WEIGHT = {
    "Placement": 3,
    "Result":    2,
    "Event":     1,
}

DEFAULT_TOP_N = 10


# ---------------------------------------------------------------------------
# Fetch notifications
# ---------------------------------------------------------------------------
def fetch_notifications(limit: int = 100, page: int = 1,
                         notification_type: Optional[str] = None) -> list[dict]:
    """Fetch notifications from the evaluation API."""
    params = {"limit": limit, "page": page}
    if notification_type:
        params["notification_type"] = notification_type

    logger.info(f"Fetching notifications: {params}")
    try:
        response = requests.get(API_URL, params=params, headers=AUTH_HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()
        notifications = data.get("notifications", [])
        logger.info(f"Fetched {len(notifications)} notifications")
        return notifications
    except requests.RequestException as e:
        logger.error(f"Failed to fetch notifications: {e}")
        return []


# ---------------------------------------------------------------------------
# Priority scoring
# ---------------------------------------------------------------------------
def parse_timestamp(ts: str) -> datetime:
    """Parse ISO timestamp to timezone-aware datetime."""
    try:
        dt = datetime.fromisoformat(ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return datetime.min.replace(tzinfo=timezone.utc)


def compute_priority_score(notification: dict,
                            oldest_ts: datetime,
                            newest_ts: datetime) -> float:
    """
    Compute a priority score for a notification.

    Score = type_weight * 10 + recency_normalized * 5

    - type_weight: Placement(3) > Result(2) > Event(1)
    - recency_normalized: 0.0 (oldest) → 1.0 (newest)
    """
    # Type score
    n_type = notification.get("Type", "")
    type_weight = TYPE_WEIGHT.get(n_type, 0)

    # Recency score (normalized)
    ts = parse_timestamp(notification.get("Timestamp", ""))
    time_range = (newest_ts - oldest_ts).total_seconds()
    if time_range > 0:
        recency = (ts - oldest_ts).total_seconds() / time_range
    else:
        recency = 1.0  # all same timestamp → treat as equally recent

    return type_weight * 10 + recency * 5


def get_priority_inbox(notifications: list[dict], top_n: int = DEFAULT_TOP_N) -> list[dict]:
    """
    Return top-N notifications ranked by priority.

    Strategy:
      1. Parse all timestamps for normalization.
      2. Compute a composite score per notification.
      3. Sort descending by score.
      4. Return top N.

    Efficient maintenance as new notifications arrive:
      - Keep a min-heap of size N (heapq).
      - Each new notification is scored and pushed; if heap > N, pop the min.
      - This gives O(log N) per insertion, O(N log N) overall.
    """
    if not notifications:
        logger.info("No notifications to rank.")
        return []

    import heapq

    timestamps = [parse_timestamp(n.get("Timestamp", "")) for n in notifications]
    oldest_ts  = min(timestamps)
    newest_ts  = max(timestamps)

    # Build scored list
    scored = []
    for notif in notifications:
        score = compute_priority_score(notif, oldest_ts, newest_ts)
        scored.append((score, notif))

    # Use heap to efficiently get top N
    top = heapq.nlargest(top_n, scored, key=lambda x: x[0])

    result = []
    for rank, (score, notif) in enumerate(top, start=1):
        enriched = dict(notif)
        enriched["_priority_score"] = round(score, 4)
        enriched["_rank"] = rank
        result.append(enriched)

    logger.info(f"Priority inbox computed: top {len(result)} of {len(notifications)} notifications")
    return result


# ---------------------------------------------------------------------------
# Display helper
# ---------------------------------------------------------------------------
def display_priority_inbox(top_notifications: list[dict]):
    print("\n" + "=" * 65)
    print(f"  PRIORITY INBOX  —  Top {len(top_notifications)} Notifications")
    print("=" * 65)
    for n in top_notifications:
        print(
            f"  #{n['_rank']:>2}  [{n['Type']:<10}]  "
            f"{n['Message']:<35}  "
            f"Score: {n['_priority_score']:>6.2f}  "
            f"Time: {n['Timestamp']}"
        )
    print("=" * 65 + "\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main(top_n: int = DEFAULT_TOP_N):
    logger.info("=== Priority Inbox — Stage 1 Start ===")

    # Fetch all notifications (paginate if needed)
    all_notifications = []
    page = 1
    while True:
        batch = fetch_notifications(limit=100, page=page)
        if not batch:
            break
        all_notifications.extend(batch)
        if len(batch) < 100:
            break
        page += 1

    logger.info(f"Total notifications fetched: {len(all_notifications)}")

    # Compute priority inbox
    priority_inbox = get_priority_inbox(all_notifications, top_n=top_n)

    # Display results
    display_priority_inbox(priority_inbox)

    return priority_inbox


if __name__ == "__main__":
    import sys
    n = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_TOP_N
    main(top_n=n)
