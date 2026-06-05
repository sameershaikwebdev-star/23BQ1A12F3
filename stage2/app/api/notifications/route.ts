import { NextResponse } from "next/server";
import { fetchAllNotifications } from "../../lib/notifications";
import { Log } from "../../utils/logger";

export async function GET() {
  try {
    const notifications = await fetchAllNotifications();

    await Log(
      "frontend",
      "info",
      "api",
      `Fetched ${notifications.length} notifications`
    );

    return NextResponse.json({
      notifications,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Unknown error";

    await Log(
      "frontend",
      "error",
      "api",
      message
    );

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}