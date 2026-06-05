# Stage 1 — Notification System Design

## Problem Statement

The campus notification platform receives a high volume of notifications across three categories: **Placement**, **Result**, and **Event**. Users lose track of important notifications due to volume. The goal is to introduce a **Priority Inbox** that always surfaces the top-N most important unread notifications first.

---

## Approach

### Priority Scoring Formula

Each notification is assigned a **composite priority score**:

```
score = type_weight × 10 + recency_normalized × 5
```

**Type Weight** (business importance):
| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

**Recency Score** (normalized 0.0 → 1.0):
- `recency = (notification_ts - oldest_ts) / (newest_ts - oldest_ts)`
- A newer notification always scores higher within the same type tier.
- Normalization ensures recency doesn't dominate over type.

**Why this formula?**
- Type weight × 10 ensures category always takes priority (Placement always outranks Result, etc.)
- Recency × 5 acts as a tiebreaker within the same type
- Weights are configurable constants — easy to tune

---

## Efficient Maintenance as New Notifications Arrive

### Challenge
New notifications keep coming in continuously. Re-sorting the entire list on every insert is expensive — O(N log N) each time.

### Solution: Min-Heap of Size N

```
For each new notification:
  1. Compute its priority score  →  O(1)
  2. Push to min-heap            →  O(log N)
  3. If heap size > N, pop min   →  O(log N)

Result: heap always holds the top-N highest-scored notifications
```

- **Insert cost:** O(log N) per notification
- **Space:** O(N) — only top N are kept in memory
- **Total for M notifications:** O(M log N)

This is significantly better than sorting the full list each time (O(M log M)).

---

## Data Flow

```
API (GET /evaluation-service/notifications)
        │
        ▼
  Fetch all pages (paginated, limit=100)
        │
        ▼
  Parse + normalize timestamps
        │
        ▼
  Compute priority score per notification
        │
        ▼
  Min-heap → extract top N
        │
        ▼
  Return ranked Priority Inbox
```

---

## Logging

All key operations (fetch, score computation, result summary) are logged via the **Logging Middleware** created in the pre-test setup. Inbuilt language loggers are not used.

---

## Assumptions

- No database storage required — notifications are fetched fresh from the API
- Users are pre-authenticated (no login/auth needed)
- "Unread" tracking is not persisted in Stage 1 (handled in Stage 2 frontend)
- Timestamps are ISO 8601 format; treated as UTC if no timezone info present

---

## Scalability Considerations

| Concern | Approach |
|---|---|
| High notification volume | Heap-based top-N — O(log N) inserts |
| API pagination | Fetch all pages before scoring |
| Real-time new arrivals | Score and push to heap on arrival, pop if > N |
| Changing N at runtime | Re-run `get_priority_inbox(notifications, top_n=N)` — stateless function |
| Tie-breaking | Recency is the tiebreaker within same type |

---

## Files

| File | Purpose |
|---|---|
| `priority_inbox.py` | Core logic — fetch, score, rank notifications |
| `Notification_System_Design.md` | This document |
