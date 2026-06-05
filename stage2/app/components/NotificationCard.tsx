"use client";
import {
  Card, CardContent, Box, Typography, Chip, IconButton, Tooltip
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import CircleIcon from "@mui/icons-material/Circle";
import StarIcon from "@mui/icons-material/Star";
import { Notification } from "../lib/notifications";

const TYPE_CONFIG = {
  Placement: { color: "#6c8eff" as const, bg: "rgba(108,142,255,0.12)", Icon: WorkIcon, label: "Placement" },
  Result:    { color: "#4caf88" as const, bg: "rgba(76,175,136,0.12)",   Icon: SchoolIcon, label: "Result" },
  Event:     { color: "#ffb347" as const, bg: "rgba(255,179,71,0.12)",   Icon: EventIcon, label: "Event" },
};

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

interface Props {
  notification: Notification;
  onMarkRead: (id: string) => void;
  showRank?: boolean;
}

export default function NotificationCard({ notification, onMarkRead, showRank }: Props) {
  const cfg = TYPE_CONFIG[notification.Type] ?? TYPE_CONFIG.Event;
  const Icon = cfg.Icon;
  const isUnread = !notification._read;

  return (
    <Card
      onClick={() => onMarkRead(notification.ID)}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        background: isUnread ? "rgba(26,29,39,0.95)" : "rgba(20,22,30,0.7)",
        border: isUnread
          ? `1px solid ${cfg.color}33`
          : "1px solid rgba(255,255,255,0.04)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: `${cfg.color}66`,
          boxShadow: `0 4px 20px ${cfg.color}22`,
        },
        position: "relative",
        overflow: "visible",
      }}
    >
      {isUnread && (
        <Box sx={{
          position: "absolute", top: 10, right: 10,
          width: 8, height: 8, borderRadius: "50%",
          background: cfg.color, boxShadow: `0 0 6px ${cfg.color}`,
        }} />
      )}

      <CardContent sx={{ p: "14px 18px !important" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {/* Icon */}
          <Box sx={{
            width: 40, height: 40, borderRadius: "10px",
            background: cfg.bg, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <Icon sx={{ color: cfg.color, fontSize: 20 }} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
              <Chip
                label={cfg.label}
                size="small"
                sx={{ background: cfg.bg, color: cfg.color, height: 20 }}
              />
              {showRank && notification._rank && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: "12px !important" }} />}
                  label={`#${notification._rank}`}
                  size="small"
                  sx={{ background: "rgba(255,200,0,0.12)", color: "#ffc800", height: 20 }}
                />
              )}
              {isUnread && (
                <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700, fontSize: "0.68rem" }}>
                  NEW
                </Typography>
              )}
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontWeight: isUnread ? 500 : 400,
                color: isUnread ? "#e0e0e0" : "#9e9e9e",
                mb: 0.5,
                lineHeight: 1.4,
              }}
            >
              {notification.Message}
            </Typography>

            <Typography variant="caption" sx={{ color: "#616161" }}>
              {formatTime(notification.Timestamp)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
