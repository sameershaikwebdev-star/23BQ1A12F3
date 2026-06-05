"use client";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";

const FILTERS = [
  { value: "", label: "All", Icon: AllInclusiveIcon, color: "#9e9e9e" },
  { value: "Placement", label: "Placement", Icon: WorkIcon, color: "#6c8eff" },
  { value: "Result", label: "Result", Icon: SchoolIcon, color: "#4caf88" },
  { value: "Event", label: "Event", Icon: EventIcon, color: "#ffb347" },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  counts: Record<string, number>;
}

export default function FilterBar({ value, onChange, counts }: Props) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {FILTERS.map(({ value: v, label, Icon, color }) => (
        <ToggleButton
          key={v}
          value={v}
          selected={value === v}
          onClick={() => onChange(v)}
          size="small"
          sx={{
            border: "1px solid rgba(255,255,255,0.08) !important",
            borderRadius: "8px !important",
            px: 1.5, py: 0.5,
            color: value === v ? color : "#9e9e9e",
            background: value === v ? `${color}18` : "transparent",
            "&:hover": { background: `${color}12` },
            transition: "all 0.15s",
            display: "flex", gap: 0.7, alignItems: "center",
          }}
        >
          <Icon sx={{ fontSize: 15 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.78rem" }}>
            {label}
          </Typography>
          {counts[v || "all"] !== undefined && (
            <Box sx={{
              background: value === v ? color : "rgba(255,255,255,0.12)",
              color: value === v ? "#fff" : "#9e9e9e",
              borderRadius: "10px", px: 0.7, py: 0.1,
              fontSize: "0.68rem", fontWeight: 700, lineHeight: 1.6,
            }}>
              {counts[v || "all"]}
            </Box>
          )}
        </ToggleButton>
      ))}
    </Box>
  );
}
