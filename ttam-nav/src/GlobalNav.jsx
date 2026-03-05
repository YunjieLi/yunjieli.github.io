import { useState, useRef, useEffect } from "react";

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

function TikTokLogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const DROPDOWN_ITEMS = [
  { id: "business-center", label: "Business center", icon: "briefcase" },
  { id: "ads-manager", label: "Ads manager", icon: "ads", active: true },
  { id: "tiktok-one", label: "TikTok One", icon: "play-monitor" },
  { id: "tiktok-symphony", label: "TikTok Symphony", icon: "play-monitor" },
  { id: "events-manager", label: "Events manager", icon: "doc" },
  { id: "leads-center", label: "Leads center", icon: "doc" },
  { id: "app-center", label: "App center", icon: "waffle" },
];

function DropdownItemIcon({ type, active }) {
  const p = iconProps;
  const color = active ? "#00d4aa" : "currentColor";
  if (type === "briefcase")
    return <svg {...p} style={{ color }}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>;
  if (type === "ads")
    return (
      <svg {...p} style={{ color }}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
        <path d="M9 12h6"/><path d="M12 9v6"/>
        <path d="M18 8l3 3-3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  if (type === "play-monitor")
    return (
      <svg {...p} style={{ color }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M10 8v6l4-3-4-3z" fill="currentColor" stroke="none"/>
      </svg>
    );
  if (type === "doc")
    return <svg {...p} style={{ color }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
  if (type === "waffle")
    return <span style={{ color, display: "flex" }}><AppLauncherIcon /></span>;
  return null;
}

const HOVER_CLOSE_DELAY_MS = 150;

export default function GlobalNav() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setDropdownOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div ref={triggerRef} style={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
      <button
        type="button"
        aria-label="Switch apps"
        title="Switch apps"
        aria-expanded={dropdownOpen}
        onMouseEnter={() => {
          clearCloseTimeout();
          setDropdownOpen(true);
        }}
        onMouseLeave={scheduleClose}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: 0,
          marginRight: 4,
          border: "none",
          borderRadius: 10,
          background: "#2c2c2e",
          color: "#fff",
          cursor: "pointer",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
          }}
        >
          <AppLauncherIcon />
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#00d4aa",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            marginRight: 6,
          }}
        >
          Y
        </span>
      </button>

      {dropdownOpen && (
        <div
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={scheduleClose}
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            marginTop: 4,
            width: 320,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            zIndex: 10001,
            overflow: "hidden",
            fontFamily: '"TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <div style={{ padding: "20px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ color: "#111", display: "flex", alignItems: "center" }}>
                <TikTokLogoIcon />
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "#111" }}>TikTok for Business</span>
            </div>
          </div>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 12,
              padding: "12px 16px",
              border: "none",
              background: "#f2f3f3",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#00d4aa",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              J
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#111" }}>Jamie Li</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#666" }}>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
            </svg>
          </button>
          <nav style={{ padding: "8px 0" }}>
            {DROPDOWN_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: 12,
                  padding: "10px 16px",
                  border: "none",
                  background: item.active ? "#E8FBF9" : "transparent",
                  color: "#111",
                  fontSize: 14,
                  fontWeight: item.active ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!item.active) e.currentTarget.style.background = "#F2F3F3";
                }}
                onMouseLeave={(e) => {
                  if (!item.active) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <DropdownItemIcon type={item.icon} active={item.active} />
                </span>
                {item.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 12,
              padding: "10px 16px",
              border: "none",
              borderTop: "1px solid #eee",
              background: "#f2f3f3",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              fontWeight: 500,
              color: "#111",
            }}
          >
            <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#666" }}>
              <svg {...iconProps} style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>
            </span>
            All tools
            <span style={{ marginLeft: "auto" }}><ChevronRightIcon /></span>
          </button>
        </div>
      )}
    </div>
  );
}
