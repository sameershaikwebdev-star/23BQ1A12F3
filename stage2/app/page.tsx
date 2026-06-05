import ThemeRegistry from "./components/ThemeRegistry";
import NotificationsClient from "./components/NotificationsClient";
import { Notification } from "./lib/notifications";

// Mock data for when API is not reachable (replace with real fetch once token is set)
const MOCK_NOTIFICATIONS: Notification[] = [
  { ID: "1", Type: "Placement", Message: "CSX Corporation hiring — Apply now", Timestamp: "2026-04-22T17:51:18" },
  { ID: "2", Type: "Placement", Message: "Advanced Micro Devices Inc. hiring", Timestamp: "2026-04-22T17:49:42" },
  { ID: "3", Type: "Result",    Message: "mid-sem results published",          Timestamp: "2026-04-22T17:51:30" },
  { ID: "4", Type: "Result",    Message: "project-review scores available",    Timestamp: "2026-04-22T17:50:42" },
  { ID: "5", Type: "Result",    Message: "external exam result out",           Timestamp: "2026-04-22T17:50:30" },
  { ID: "6", Type: "Result",    Message: "project-review final grades",        Timestamp: "2026-04-22T17:50:18" },
  { ID: "7", Type: "Result",    Message: "mid-sem supplementary results",      Timestamp: "2026-04-22T17:50:54" },
  { ID: "8", Type: "Event",     Message: "farewell ceremony — Main Hall",      Timestamp: "2026-04-22T17:51:06" },
  { ID: "9", Type: "Event",     Message: "tech-fest registrations open",       Timestamp: "2026-04-22T17:50:06" },
  { ID: "10", Type: "Placement", Message: "Google summer internship drive",    Timestamp: "2026-04-22T17:48:00" },
  { ID: "11", Type: "Result",    Message: "lab evaluation marks released",     Timestamp: "2026-04-22T17:47:30" },
  { ID: "12", Type: "Event",     Message: "hackathon — registration deadline", Timestamp: "2026-04-22T17:46:00" },
];

async function getNotifications(): Promise<Notification[]> {
  try {
    const res = await fetch("http://4.224.186.213/evaluation-service/notifications", {
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYW1lZXJzaGFpay53ZWJkZXZAZ21haWwuY29tIiwiZXhwIjoxNzgwNjM2OTk4LCJpYXQiOjE3ODA2MzYwOTgsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1YzI3ODY2OS0yMzJjLTQ0NTYtYTY0YS0zMDI4NGYwYmNhMTciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzYW1lZXIgc2hhaWsiLCJzdWIiOiJmY2Y4MTAyYi1kYjhiLTRiNzItYmRiZS1hZjg1MjBlZmEzYzkifSwiZW1haWwiOiJzYW1lZXJzaGFpay53ZWJkZXZAZ21haWwuY29tIiwibmFtZSI6InNhbWVlciBzaGFpayIsInJvbGxObyI6IjIzYnExYTEyZjMiLCJhY2Nlc3NDb2RlIjoiUVFkRVl5IiwiY2xpZW50SUQiOiJmY2Y4MTAyYi1kYjhiLTRiNzItYmRiZS1hZjg1MjBlZmEzYzkiLCJjbGllbnRTZWNyZXQiOiJnYVVkbVdLTmhiV0dXQ3ltIn0.3WCYl4e5Vs7CtCPjHj43eRAKQVSxlsk1glamrup174g",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("API unavailable");
    const data = await res.json();
    return data.notifications ?? MOCK_NOTIFICATIONS;
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}

export default async function Home() {
  const notifications = await getNotifications();

  return (
    <ThemeRegistry>
      <NotificationsClient initialNotifications={notifications} />
    </ThemeRegistry>
  );
}
