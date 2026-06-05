"use client";
import { useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Tabs, Tab, Badge, CircularProgress,
  Alert, TextField, InputAdornment, Slider, Paper,
  IconButton, Tooltip, Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Notification, getPriorityInbox } from "../lib/notifications";
import NotificationCard from "./NotificationCard";
import FilterBar from "./FilterBar";

interface Props {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications.map((n, i) => ({ ...n, _read: i > 4 })) // first 5 unread for demo
  );
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.ID === id ? { ...n, _read: true } : n)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, _read: true })));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Unknown error";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered & searched notifications
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchType = !filter || n.Type === filter;
      const matchSearch = !search ||
        n.Message.toLowerCase().includes(search.toLowerCase()) ||
        n.Type.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [notifications, filter, search]);

  // Priority inbox
  const priorityInbox = useMemo(() => {
    return getPriorityInbox(notifications, topN);
  }, [notifications, topN]);

  const unreadCount = notifications.filter(n => !n._read).length;

  const counts = useMemo(() => ({
    all: notifications.length,
    Placement: notifications.filter(n => n.Type === "Placement").length,
    Result: notifications.filter(n => n.Type === "Result").length,
    Event: notifications.filter(n => n.Type === "Event").length,
  }), [notifications]);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: "12px",
            background: "linear-gradient(135deg, #6c8eff22, #6c8eff44)",
            border: "1px solid #6c8eff33",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <NotificationsIcon sx={{ color: "#6c8eff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1, color: "#f0f0f0" }}>
              Campus Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: "#616161" }}>
              AffordMed Platform
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton onClick={markAllRead} size="small" sx={{ color: "#9e9e9e" }}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Refresh">
            <IconButton onClick={refresh} disabled={loading} size="small" sx={{ color: "#9e9e9e" }}>
              {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": { background: "#6c8eff", height: 2 },
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Tab
          label={
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <Box sx={{ pr: unreadCount > 0 ? 1.5 : 0 }}>All Notifications</Box>
            </Badge>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
              <StarIcon sx={{ fontSize: 16, color: "#ffc800" }} />
              Priority Inbox
            </Box>
          }
        />
      </Tabs>

      {/* ALL NOTIFICATIONS TAB */}
      {tab === 0 && (
        <Box>
          {/* Search + Filter */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Search notifications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{
                flex: 1, minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  background: "#1a1d27",
                  borderRadius: "10px",
                  "& fieldset": { border: "1px solid rgba(255,255,255,0.08)" },
                  "&:hover fieldset": { border: "1px solid rgba(255,255,255,0.15)" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#616161", fontSize: 18 }} /></InputAdornment>,
                }
              }}
            />
            <FilterBar value={filter} onChange={setFilter} counts={counts} />
          </Box>

          {/* Stats */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
            {[
              { label: "Total", value: counts.all, color: "#9e9e9e" },
              { label: "Unread", value: unreadCount, color: "#6c8eff" },
              { label: "Showing", value: filtered.length, color: "#4caf88" },
            ].map(({ label, value, color }) => (
              <Paper key={label} sx={{ px: 2, py: 1, background: "#1a1d27", flex: 1, textAlign: "center" }}>
                <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ color: "#616161" }}>{label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Notification List */}
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "#424242" }}>
              <NotificationsIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
              <Typography>No notifications found</Typography>
            </Box>
          ) : (
            <Box>
              {/* Unread section */}
              {filtered.filter(n => !n._read).length > 0 && (
                <>
                  <Typography variant="caption" sx={{ color: "#616161", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", mb: 1 }}>
                    Unread · {filtered.filter(n => !n._read).length}
                  </Typography>
                  {filtered.filter(n => !n._read).map(n => (
                    <NotificationCard key={n.ID} notification={n} onMarkRead={markRead} />
                  ))}
                  <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.05)" }} />
                </>
              )}
              {/* Read section */}
              {filtered.filter(n => n._read).length > 0 && (
                <>
                  <Typography variant="caption" sx={{ color: "#424242", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", mb: 1 }}>
                    Earlier · {filtered.filter(n => n._read).length}
                  </Typography>
                  {filtered.filter(n => n._read).map(n => (
                    <NotificationCard key={n.ID} notification={n} onMarkRead={markRead} />
                  ))}
                </>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* PRIORITY INBOX TAB */}
      {tab === 1 && (
        <Box>
          <Paper sx={{ p: 2.5, mb: 3, background: "#1a1d27" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#e0e0e0" }}>
                Top N notifications
              </Typography>
              <Typography sx={{ color: "#ffc800", fontWeight: 700, fontSize: "1.1rem" }}>
                N = {topN}
              </Typography>
            </Box>
            <Slider
              value={topN}
              min={5}
              max={Math.min(50, notifications.length || 50)}
              step={5}
              onChange={(_, v) => setTopN(v as number)}
              marks
              sx={{
                color: "#6c8eff",
                "& .MuiSlider-mark": { background: "rgba(108,142,255,0.3)" },
                "& .MuiSlider-thumb": { boxShadow: "0 0 8px #6c8eff66" },
              }}
            />
            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Typography variant="caption" sx={{ color: "#616161" }}>
                Priority: <span style={{ color: "#6c8eff" }}>Placement</span> &gt; <span style={{ color: "#4caf88" }}>Result</span> &gt; <span style={{ color: "#ffb347" }}>Event</span> · then by recency
              </Typography>
            </Box>
          </Paper>

          {priorityInbox.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "#424242" }}>
              <StarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
              <Typography>No notifications to rank</Typography>
            </Box>
          ) : (
            priorityInbox.map(n => (
              <NotificationCard key={n.ID} notification={n} onMarkRead={markRead} showRank />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
