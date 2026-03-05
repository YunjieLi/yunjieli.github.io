import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const TOP_BAR_HEIGHT = 52;
const RAIL_WIDTH = 60;
const OVERLAY_WIDTH = 220;
const OVERLAY_TRANSITION = "transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)";
const MORE_TOOLS_PANEL_WIDTH = 560;
const MORE_TOOLS_PANEL_TRANSITION = "width 0.26s cubic-bezier(0.32, 0.72, 0, 1)";
const OVERLAY_OPEN_DURATION_MS = 280;
const LEFT_NAV_HOVER_CLOSE_DELAY_MS = 180;

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

const MORE_TOOLS_COLUMNS = [
  {
    title: "Creatives",
    items: [
      { label: "Creatives" },
      { label: "Creative challenge" },
      { label: "Instant page" },
      { label: "Video editor", new: true },
      { label: "TikTok Symphony", external: true },
      { label: "Creative inspiration" },
      { label: "Content Suite", new: true },
      { label: "Ad preview tool", new: true },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Analytics" },
      { label: "Experiment manager" },
      { label: "Audience insights" },
      { label: "Comment insights" },
      { label: "Attribution analytics" },
      { label: "Video insights" },
    ],
  },
  {
    title: "Audience",
    items: [
      { label: "Audience" },
      { label: "Audience manager" },
      { label: "Comment manager" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Management" },
      { label: "Recommendation center" },
      { label: "Automated rules" },
      { label: "Leads Center", external: true },
      { label: "Planner", new: true, external: true },
      { label: "Pangle brand safety" },
    ],
  },
  {
    title: "Search center",
    items: [
      { label: "Search center" },
      { label: "Keyword planner", new: true, external: true },
      { label: "Negative keywords" },
      { label: "Branded search hub" },
      { label: "Search ads inspiration", new: true },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Settings" },
      { label: "Audience controls" },
      { label: "Brand safety hub" },
      { label: "Documents" },
    ],
  },
];

const navItemStyle = (open, isActive, isHovered) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: open ? "9px 14px" : "9px 0",
  justifyContent: open ? "flex-start" : "center",
  margin: "1px 8px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  background: isActive ? "#e6f7f7" : isHovered ? "#F2F3F3" : "transparent",
  fontWeight: isActive ? 600 : 400,
});

const HOVER_MENU_CLOSE_DELAY_MS = 150;

function RailIcon({ icon, isActive, onClick, label, children: childItems, onChildClick }) {
  const [hover, setHover] = useState(false);
  const [coords, setCoords] = useState(null);
  const ref = useRef(null);
  const closeTimeoutRef = useRef(null);
  const hasMenu = childItems && childItems.length > 0;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setHover(false);
      setCoords(null);
      closeTimeoutRef.current = null;
    }, HOVER_MENU_CLOSE_DELAY_MS);
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setHover(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({ left: rect.right, top: rect.top, height: rect.height });
    }
  };

  const handleMouseLeave = () => {
    if (hasMenu) scheduleClose();
    else {
      setHover(false);
      setCoords(null);
    }
  };

  useEffect(() => () => clearCloseTimeout(), []);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  const handleChildClick = (childLabel) => {
    onChildClick?.(childLabel);
    setHover(false);
    setCoords(null);
  };

  const tooltipOrMenuEl = hover && coords && !hasMenu ? (
    <div
      style={{
        position: "fixed",
        left: coords.left + 8,
        top: coords.top + coords.height / 2,
        transform: "translateY(-50%)",
        padding: "6px 10px",
        background: "#fff",
        color: "#1c1c1e",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: '"TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        borderRadius: 6,
        whiteSpace: "nowrap",
        border: "1px solid #e5e5e7",
        zIndex: 10000,
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  ) : hover && coords && hasMenu ? (
    <div
      role="menu"
      onMouseEnter={clearCloseTimeout}
      onMouseLeave={scheduleClose}
      style={{
        position: "fixed",
        left: coords.left + 8,
        top: coords.top,
        minWidth: 180,
        background: "#fff",
        color: "#111",
        fontSize: 14,
        fontFamily: '"TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        borderRadius: 10,
        border: "1px solid #e5e5e7",
        zIndex: 10000,
        padding: "10px 0",
        pointerEvents: "auto",
      }}
    >
      {/* Left caret */}
      <div
        style={{
          position: "absolute",
          left: -6,
          top: 16,
          width: 0,
          height: 0,
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderRight: "6px solid #fff",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px 10px",
          fontWeight: 600,
          color: "#111",
        }}
      >
        <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>
        <span>{label}</span>
      </div>
      {childItems.map((childLabel) => (
        <button
          key={childLabel}
          type="button"
          role="menuitem"
          onClick={() => handleChildClick(childLabel)}
          style={{
            display: "block",
            width: "100%",
            padding: "8px 16px 8px 46px",
            border: "none",
            background: "none",
            textAlign: "left",
            fontSize: 14,
            color: "#111",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F2F3F3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
          }}
        >
          {childLabel}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={hasMenu ? undefined : label}
      aria-label={label}
      aria-haspopup={hasMenu ? "menu" : undefined}
      aria-expanded={hasMenu ? hover : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 0",
        margin: "1px 8px",
        borderRadius: 6,
        cursor: "pointer",
        background: isActive ? "#e6f7f7" : hover ? "#F2F3F3" : "transparent",
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {tooltipOrMenuEl && createPortal(tooltipOrMenuEl, document.body)}
    </div>
  );
}

export default function LeftNav({ open, onToggleOpen, active, onActiveChange, assetsOpen, onAssetsOpenChange, navMode = "onClick" }) {
  const leftNavCloseTimeoutRef = useRef(null);
  const hoverToOpen = navMode === "onHover";

  const clearLeftNavCloseTimeout = useCallback(() => {
    if (leftNavCloseTimeoutRef.current) {
      clearTimeout(leftNavCloseTimeoutRef.current);
      leftNavCloseTimeoutRef.current = null;
    }
  }, []);

  const scheduleLeftNavClose = useCallback(() => {
    clearLeftNavCloseTimeout();
    leftNavCloseTimeoutRef.current = setTimeout(() => {
      onToggleOpen(false);
      leftNavCloseTimeoutRef.current = null;
    }, LEFT_NAV_HOVER_CLOSE_DELAY_MS);
  }, [onToggleOpen, clearLeftNavCloseTimeout]);

  useEffect(() => () => clearLeftNavCloseTimeout(), [clearLeftNavCloseTimeout]);

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

  const [hoveredId, setHoveredId] = useState(null);
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);
  const [toggleTooltip, setToggleTooltip] = useState(false);
  const [toggleTooltipCoords, setToggleTooltipCoords] = useState(null);
  const toggleRef = useRef(null);
  const [overlayToggleTooltip, setOverlayToggleTooltip] = useState(false);
  const [overlayToggleCoords, setOverlayToggleCoords] = useState(null);
  const overlayToggleRef = useRef(null);

  const toggleButtonStyle = (isExpanded) => ({
    padding: 16,
    cursor: "pointer",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: isExpanded ? "flex-start" : "center",
  });

  const isCurrentPage = (id) => {
    if (id === "More tools") return false;
    const navItem = NAV.find((n) => n.id === id);
    if (navItem?.children) return navItem.children.includes(active);
    return active === id;
  };

  const renderNavItems = (expanded) => (
    <>
      {NAV.map((item) => (
        <div key={item.id}>
          <div
            onClick={() => {
              if (item.id === "More tools") {
                openMoreTools(true);
                return;
              }
              if (item.children) {
                onAssetsOpenChange((x) => !x);
                return;
              }
              onActiveChange(item.id);
              onToggleOpen(false);
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={navItemStyle(expanded, isCurrentPage(item.id), hoveredId === item.id)}
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
                onClick={() => {
                  onActiveChange(c);
                  onToggleOpen(false);
                }}
                onMouseEnter={() => setHoveredId(c)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: "7px 14px 7px 44px",
                  fontSize: 14,
                  cursor: "pointer",
                  borderRadius: 6,
                  margin: "1px 8px",
                  color: active === c ? "#111" : "#666",
                  fontWeight: active === c ? 500 : 400,
                  background: active === c ? "#e6f7f7" : hoveredId === c ? "#F2F3F3" : "transparent",
                }}
              >
                {c}
              </div>
            ))}
        </div>
      ))}
    </>
  );

  const backdropStyle = {
    position: "fixed",
    left: open && moreToolsOpen ? OVERLAY_WIDTH + MORE_TOOLS_PANEL_WIDTH : OVERLAY_WIDTH,
    top: TOP_BAR_HEIGHT,
    right: 0,
    bottom: 0,
    zIndex: 99,
  };

  const closeOverlay = () => {
    setMoreToolsOpen(false);
    if (moreToolsOpen) {
      setTimeout(() => onToggleOpen(false), 220);
    } else {
      onToggleOpen(false);
    }
  };

  const openMoreTools = (overlayAlreadyOpen) => {
    if (moreToolsOpen) {
      setMoreToolsOpen(false);
      return;
    }
    if (overlayAlreadyOpen) {
      setMoreToolsOpen(true);
    } else {
      onToggleOpen(true);
      setTimeout(() => setMoreToolsOpen(true), OVERLAY_OPEN_DURATION_MS);
    }
  };

  return (
    <>
      {/* Click outside: collapse when expanded */}
      {open && (
        <div
          style={backdropStyle}
          onClick={closeOverlay}
          aria-hidden="true"
        />
      )}

      {/* Always-visible 60px rail */}
      <nav
        style={railStyle}
        onMouseEnter={hoverToOpen ? () => { clearLeftNavCloseTimeout(); onToggleOpen(true); } : undefined}
        onMouseLeave={hoverToOpen ? scheduleLeftNavClose : undefined}
      >
        <div
          style={{ ...scrollAreaStyle, cursor: open || hoverToOpen ? undefined : "pointer" }}
          onClick={() => !open && onToggleOpen(true)}
          role="presentation"
        >
          {NAV.map((item) => (
            <RailIcon
              key={item.id}
              icon={item.icon}
              isActive={(active === item.id && item.id !== "More tools") || (item.children && item.children.includes(active))}
              label={item.id}
              children={item.children}
              onChildClick={item.children ? (child) => {
                onActiveChange(child);
                onAssetsOpenChange(false);
                onToggleOpen(false);
              } : undefined}
              onClick={() => {
                if (item.id === "More tools") {
                  openMoreTools(open);
                  return;
                }
                if (item.children) return;
                onActiveChange(item.id);
                onToggleOpen(false);
              }}
            />
          ))}
        </div>
        {!hoverToOpen && (
          <div
            ref={toggleRef}
            onClick={() => onToggleOpen((x) => !x)}
            style={{ ...toggleButtonStyle(false), borderTop: "none", cursor: "pointer" }}
            title={open ? "Collapse menu" : "Expand menu"}
            onMouseEnter={() => {
              setToggleTooltip(true);
              if (toggleRef.current) {
                const rect = toggleRef.current.getBoundingClientRect();
                setToggleTooltipCoords({ left: rect.right + 8, top: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => {
              setToggleTooltip(false);
              setToggleTooltipCoords(null);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1={open ? 9 : 15} y1="3" x2={open ? 9 : 15} y2="21"/>
            </svg>
          </div>
        )}
      </nav>
      {!hoverToOpen && toggleTooltip && toggleTooltipCoords && createPortal(
        <div
          style={{
            position: "fixed",
            left: toggleTooltipCoords.left,
            top: toggleTooltipCoords.top,
            transform: "translateY(-50%)",
            padding: "6px 10px",
            background: "#fff",
            color: "#1c1c1e",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: '"TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            borderRadius: 6,
            whiteSpace: "nowrap",
            border: "1px solid #e5e5e7",
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          {open ? "Collapse menu" : "Expand menu"}
        </div>,
        document.body
      )}

      {/* Expanded overlay (always in DOM for exit transition) */}
      <div
        style={overlayWrapperStyle}
        aria-hidden={!open}
        onMouseEnter={hoverToOpen ? clearLeftNavCloseTimeout : undefined}
        onMouseLeave={hoverToOpen ? scheduleLeftNavClose : undefined}
      >
        <div style={overlayPanelStyle}>
          <div style={scrollAreaStyle}>
            {renderNavItems(true)}
          </div>
          <div
            ref={overlayToggleRef}
            onClick={() => {
              onToggleOpen((x) => !x);
              setMoreToolsOpen(false);
            }}
            style={{ ...toggleButtonStyle(true), borderTop: "none" }}
            title="Collapse menu"
            onMouseEnter={() => {
              setOverlayToggleTooltip(true);
              if (overlayToggleRef.current) {
                const rect = overlayToggleRef.current.getBoundingClientRect();
                setOverlayToggleCoords({ left: rect.right + 8, top: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => {
              setOverlayToggleTooltip(false);
              setOverlayToggleCoords(null);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </div>
        </div>
      </div>
      {overlayToggleTooltip && overlayToggleCoords && open && createPortal(
        <div
          style={{
            position: "fixed",
            left: overlayToggleCoords.left,
            top: overlayToggleCoords.top,
            transform: "translateY(-50%)",
            padding: "6px 10px",
            background: "#fff",
            color: "#1c1c1e",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: '"TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            borderRadius: 6,
            whiteSpace: "nowrap",
            border: "1px solid #e5e5e7",
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          Collapse menu
        </div>,
        document.body
      )}

      {/* More tools panel (always in DOM when overlay open, for transition) */}
      {open && (
        <div
          style={{
            position: "fixed",
            left: OVERLAY_WIDTH,
            top: TOP_BAR_HEIGHT,
            width: moreToolsOpen ? MORE_TOOLS_PANEL_WIDTH : 0,
            bottom: 0,
            zIndex: 100,
            background: "#fff",
            borderRight: "1px solid #ebebeb",
            overflow: "hidden",
            transition: MORE_TOOLS_PANEL_TRANSITION,
            pointerEvents: moreToolsOpen ? "auto" : "none",
          }}
          aria-label="More tools"
          aria-hidden={!moreToolsOpen}
        >
          <div
            style={{
              width: MORE_TOOLS_PANEL_WIDTH,
              minHeight: "100%",
              overflowY: "auto",
              padding: "24px 20px",
              fontFamily: '"TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600, color: "#111" }}>
            More tools
          </h2>
          <div
            style={{
              columnCount: 2,
              WebkitColumnCount: 2,
              columnGap: 32,
              columnFill: "balance",
              width: "100%",
            }}
          >
            {MORE_TOOLS_COLUMNS.map((col) => (
              <div
                key={col.title}
                style={{
                  breakInside: "avoid",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    marginBottom: 10,
                  }}
                >
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {col.items.map((entry) => (
                    <a
                      key={entry.label}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 0",
                        fontSize: 14,
                        color: "#111",
                        textDecoration: "none",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F2F3F3";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span>{entry.label}</span>
                      {entry.new && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "#E8E0F0",
                            color: "#6B4E9B",
                          }}
                        >
                          New
                        </span>
                      )}
                      {entry.external && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}
    </>
  );
}
