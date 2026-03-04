const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function AppLauncherIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <rect x="15" y="9" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg {...iconProps}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg {...iconProps}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function TopBar() {
  return (
    <header
      className="top-bar"
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 52,
        padding: "0 20px",
        background: "#1c1c1e",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Left group */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: 0, flex: "1 1 auto", overflow: "hidden" }}>
        <button
          type="button"
          aria-label="App launcher"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 36,
            marginRight: -8,
            padding: 0,
            border: "none",
            borderRadius: 8,
            background: "#2c2c2e",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <AppLauncherIcon />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#00d4aa",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            marginRight: 12,
            flexShrink: 0,
          }}
        >
          Y
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            TikTok
          </span>
          <span style={{ fontSize: 14, color: "#8e8e93", fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Ads Manager
          </span>
        </div>
      </div>

      {/* Right group */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, minWidth: 0 }}>
        <button
          type="button"
          aria-label="Search"
          style={iconButtonStyle}
        >
          <SearchIcon />
        </button>
        <button type="button" aria-label="Notifications" style={{ ...iconButtonStyle, position: "relative" }}>
          <BellIcon />
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#ff3b30",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            2
          </span>
        </button>
        <button type="button" aria-label="Help" style={iconButtonStyle}>
          <HelpIcon />
        </button>
        <div style={{ position: "relative", minWidth: 0 }}>
          <button
            type="button"
            onClick={() => {}}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              padding: "0 12px",
              border: "1px solid #3a3a3c",
              borderRadius: 8,
              background: "#2c2c2e",
              color: "#8e8e93",
              fontSize: 14,
              cursor: "pointer",
              minWidth: 0,
              maxWidth: 160,
            }}
          >
            <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>upstream.land</span>
            <ChevronDownIcon />
          </button>
        </div>
        <button
          type="button"
          aria-label="Messages"
          style={{ ...iconButtonStyle, color: "#00d4aa" }}
        >
          <EnvelopeIcon />
        </button>
      </div>
    </header>
  );
}

const iconButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
};
