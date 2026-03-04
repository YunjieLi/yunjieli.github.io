const TOP_BAR_HEIGHT = 52;
const RAIL_WIDTH = 60;
const OVERLAY_WIDTH = 220;
const OVERLAY_TRANSITION = "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)";

const sp = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const NAV = [
  { id: "Dashboard", icon: <svg {...sp}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><polyline points="9 21 9 12 15 12 15 21"/></svg> },
  { id: "Campaigns", icon: <svg {...sp}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
  { id: "Assets", icon: <svg {...sp}><rect x="3" y="5" width="16" height="13" rx="1.5"/><rect x="6" y="2" width="16" height="13" rx="1.5"/></svg>, children: ["Events manager", "Catalog manager", "Creative library"] },
  { id: "Custom reports", icon: <svg {...sp}><rect x="3" y="3" width="13" height="17" rx="1.5"/><rect x="8" y="1" width="13" height="17" rx="1.5"/></svg> },
  { id: "Payment", icon: <svg {...sp}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { id: "Account setup", icon: <svg {...sp}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id: "GMV Max", icon: <svg {...sp}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { id: "More tools", icon: <svg {...sp}><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>, arrow: true },
];

const navItemStyle = (open, active, isActive) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: open ? "9px 14px" : "9px 0",
  justifyContent: open ? "flex-start" : "center",
  margin: "1px 8px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  background: isActive ? "#f4f4f4" : "transparent",
  fontWeight: isActive ? 600 : 400,
});

export default function LeftNav({ open, onToggleOpen, active, onActiveChange, assetsOpen, onAssetsOpenChange }) {
  const railStyle = {
    width: RAIL_WIDTH,
    minWidth: RAIL_WIDTH,
    flexShrink: 0,
    minHeight: 0,
    background: "#fff",
    borderRight: "1px solid #ebebeb",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const overlayWrapperStyle = {
    position: "fixed",
    left: 0,
    top: TOP_BAR_HEIGHT,
    width: OVERLAY_WIDTH,
    height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
    zIndex: 100,
    overflow: "hidden",
    pointerEvents: open ? "auto" : "none",
  };

  const overlayPanelStyle = {
    width: OVERLAY_WIDTH,
    height: "100%",
    background: "#fff",
    borderRight: "1px solid #ebebeb",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
    transform: open ? "translateX(0)" : "translateX(-100%)",
    transition: OVERLAY_TRANSITION,
  };

  const scrollAreaStyle = {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    paddingTop: 20,
  };

  const toggleButtonStyle = (isExpanded) => ({
    padding: 16,
    cursor: "pointer",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: isExpanded ? "flex-start" : "center",
  });

  const renderNavItems = (expanded) => (
    <>
      {NAV.map((item) => (
        <div key={item.id}>
          <div
            onClick={() => {
              onActiveChange(item.id);
              if (item.children) onAssetsOpenChange((x) => !x);
            }}
            style={navItemStyle(expanded, active, active === item.id)}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {expanded && (
              <>
                <span style={{ flex: 1 }}>{item.id}</span>
                {item.children && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
                    {assetsOpen ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                  </svg>
                )}
                {item.arrow && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </>
            )}
          </div>
          {item.children && expanded && assetsOpen &&
            item.children.map((c) => (
              <div
                key={c}
                onClick={() => onActiveChange(c)}
                style={{
                  padding: "7px 14px 7px 44px",
                  fontSize: 14,
                  cursor: "pointer",
                  borderRadius: 6,
                  margin: "1px 8px",
                  color: active === c ? "#111" : "#666",
                  fontWeight: active === c ? 500 : 400,
                  background: active === c ? "#f4f4f4" : "transparent",
                }}
              >
                {c}
              </div>
            ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Always-visible 60px rail */}
      <nav style={railStyle}>
        <div style={scrollAreaStyle}>
          {NAV.map((item) => (
            <div key={item.id}>
              <div
                onClick={() => {
                  onActiveChange(item.id);
                  if (item.children) onAssetsOpenChange((x) => !x);
                }}
                style={navItemStyle(false, active, active === item.id)}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
              </div>
            </div>
          ))}
        </div>
        <div
          onClick={() => onToggleOpen((x) => !x)}
          style={toggleButtonStyle(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1={open ? 9 : 15} y1="3" x2={open ? 9 : 15} y2="21"/>
          </svg>
        </div>
      </nav>

      {/* Expanded overlay (always in DOM for exit transition) */}
      <div style={overlayWrapperStyle} aria-hidden={!open}>
        <div style={overlayPanelStyle}>
          <div style={scrollAreaStyle}>
            {renderNavItems(true)}
          </div>
          <div
            onClick={() => onToggleOpen((x) => !x)}
            style={toggleButtonStyle(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
