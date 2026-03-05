import { useState } from "react";

const iconSvg = (path, props = {}) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {path}
  </svg>
);

const FolderIcon = () => iconSvg(<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />);
const ArrowRightIcon = () => iconSvg(<path d="M5 12h14M12 5l7 7-7 7" />);
const WarningIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12 2L1 21h22L12 2z" />
  </svg>
);
const SearchIcon = () => iconSvg(<><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>);
const CalendarIcon = () => iconSvg(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>);
const RefreshIcon = () => iconSvg(<><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>);
const TableIcon = () => iconSvg(<><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></>);
const MoreVerticalIcon = () => iconSvg(<><circle cx="12" cy="5" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="19" r="1.5" fill="currentColor" /></>);
const SortUpIcon = () => iconSvg(<path d="M11 18V6M7 10l4-4 4 4" />);
const InfoIcon = () => iconSvg(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>);
const CollapseIcon = () => iconSvg(<path d="M15 18l-6-6 6-6" />);

const SIDEBAR_WIDTH = 220;

const SAMPLE_CAMPAIGNS = [
  { id: 1, on: true, name: "App promotion20260304144441", status: "Active", budget: "All", budgetSub: null, po: "-", cost: "0.00 USD", cpc: "0.00 USD", cpm: "0.00 USD" },
  { id: 2, on: false, name: "Lead generation20260304214557", status: "Active", budget: "50.00 USD", budgetSub: null, po: "-", cost: "0.00 USD", cpc: "0.00 USD", cpm: "0.00 USD" },
  { id: 3, on: true, name: "Copy 1 of 【勿删】 Traffic spc", status: "Not delivering", statusSub: "Out of campaign budget", budget: "1,111.00 USD", budgetSub: "Daily, Campaign bud...", po: "222", cost: "0.00 USD", cpc: "0.00 USD", cpm: "0.00 USD" },
  { id: 4, on: true, name: "Test campaign A", status: "Active", budget: "100.00 USD", budgetSub: null, po: "-", cost: "0.00 USD", cpc: "0.00 USD", cpm: "0.00 USD" },
  { id: 5, on: false, name: "Brand awareness Q1", status: "Active", budget: "All", budgetSub: null, po: "333", cost: "0.00 USD", cpc: "0.00 USD", cpm: "0.00 USD" },
];

export default function CampaignsPage() {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toggles, setToggles] = useState(Object.fromEntries(SAMPLE_CAMPAIGNS.map((c) => [c.id, c.on])));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    if (checked) setSelectedIds(new Set(SAMPLE_CAMPAIGNS.map((c) => c.id)));
    else setSelectedIds(new Set());
  };

  const toggleOnOff = (id) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allSelected = SAMPLE_CAMPAIGNS.length > 0 && selectedIds.size === SAMPLE_CAMPAIGNS.length;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, minWidth: 0, background: "#fafafa" }}>
      {/* Left sidebar */}
      <aside
        style={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          background: "#f2f3f3",
          borderRight: "1px solid #e5e6e6",
          display: "flex",
          flexDirection: "column",
          padding: "16px 0",
          fontSize: 14,
          color: "#111",
        }}
      >
        <nav style={{ flex: 1 }}>
          <div style={{ padding: "0 16px", marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                background: "#E8FBF9",
                fontWeight: 500,
              }}
            >
              <FolderIcon />
              <span>Campaign</span>
              <span style={{ marginLeft: "auto", color: "#e65c00" }}>
                <WarningIcon />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", color: "#666" }}>
              <FolderIcon />
              <span>Ad group</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", color: "#666" }}>
              <FolderIcon />
              <span>Ad</span>
            </div>
          </div>
          <div style={{ padding: "0 16px", marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingLeft: 12 }}>
              Management
            </div>
            {["Split test", "Bulk export/import", "Automated rules", "Label"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                <span>{label}</span>
                <ArrowRightIcon />
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 16px 8px 12px", marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#111", cursor: "pointer" }}>
              <span>View report</span>
              <span style={{ fontSize: 10, fontWeight: 600, background: "#00d4aa", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>New</span>
            </div>
          </div>
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e6e6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", cursor: "pointer", fontSize: 14 }}>
            <CollapseIcon />
            <span>Collapse</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff", overflow: "hidden" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 24px",
            borderBottom: "1px solid #e5e6e6",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#00d4aa",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            + Create
          </button>
          <div
            style={{
              flex: 1,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "#f2f3f3",
              borderRadius: 8,
              color: "#666",
              fontSize: 14,
            }}
          >
            <SearchIcon />
            <span style={{ color: "#999" }}>Search & filter (/) | Tips: Search by name, ID, settings, metrics, or other filters</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              border: "1px solid #e5e6e6",
              borderRadius: 8,
              fontSize: 14,
              color: "#111",
            }}
          >
            <CalendarIcon />
            <span>2026-02-26 - 2026-03-05</span>
            <RefreshIcon />
          </div>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              border: "1px solid #e5e6e6",
              borderRadius: 8,
              background: "#fff",
              fontSize: 14,
              color: "#111",
              cursor: "pointer",
            }}
          >
            <TableIcon />
            Custom table
          </button>
          <button type="button" style={{ padding: 8, border: "none", background: "none", cursor: "pointer", color: "#666" }}>
            <MoreVerticalIcon />
          </button>
        </div>

        {/* Info banner */}
        <div style={{ padding: "12px 24px", background: "#f2f3f3", fontSize: 14, color: "#111" }}>
          You have 100 draft campaigns
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e6e6" }}>
                <th style={{ width: 40, padding: "12px 16px", textAlign: "left" }}>
                  <input type="checkbox" checked={allSelected} onChange={(e) => toggleSelectAll(e.target.checked)} style={{ cursor: "pointer" }} />
                </th>
                <th style={{ width: 70, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>On/off</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Name
                    <SortUpIcon />
                  </span>
                </th>
                <th style={{ width: 140, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>Status</th>
                <th style={{ width: 140, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>Budget</th>
                <th style={{ width: 120, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>Purchase Order number</th>
                <th style={{ width: 100, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>Cost</th>
                <th style={{ width: 120, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>CPC (destination)</th>
                <th style={{ width: 100, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>CPM</th>
                <th style={{ width: 100, padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "#111" }}>Impression</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_CAMPAIGNS.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={toggles[row.id]}
                      onClick={() => toggleOnOff(row.id)}
                      style={{
                        width: 36,
                        height: 20,
                        borderRadius: 10,
                        border: "none",
                        background: toggles[row.id] ? "#00d4aa" : "#ccc",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: toggles[row.id] ? 18 : 2,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.15s ease",
                        }}
                      />
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#111" }}>{row.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>
                      {row.status === "Active" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa" }} />
                          Active
                        </span>
                      ) : (
                        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#e65c00" }}>
                            <WarningIcon />
                            Not delivering
                          </span>
                          {row.statusSub && <span style={{ fontSize: 12, color: "#666" }}>{row.statusSub}</span>}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>
                      <span>{row.budget}</span>
                      {row.budgetSub && <div style={{ fontSize: 12, color: "#666" }}>{row.budgetSub}</div>}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#111" }}>{row.po}</td>
                  <td style={{ padding: "12px 16px", color: "#111" }}>{row.cost}</td>
                  <td style={{ padding: "12px 16px", color: "#111" }}>{row.cpc}</td>
                  <td style={{ padding: "12px 16px", color: "#111" }}>{row.cpm}</td>
                  <td style={{ padding: "12px 16px", color: "#111" }}>0.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderTop: "1px solid #e5e6e6",
            background: "#fafafa",
            fontSize: 14,
            color: "#666",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Total of 8831 campaigns
            <span style={{ color: "#999" }}><InfoIcon /></span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" style={{ padding: "6px 10px", border: "1px solid #e5e6e6", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#666" }}>←</button>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #e5e6e6",
                    borderRadius: 6,
                    background: p === 1 ? "#00d4aa" : "#fff",
                    color: p === 1 ? "#fff" : "#111",
                    cursor: "pointer",
                    fontWeight: p === 1 ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              ))}
              <span style={{ padding: "0 4px" }}>...</span>
              <button type="button" style={{ padding: "6px 10px", border: "1px solid #e5e6e6", borderRadius: 6, background: "#fff", cursor: "pointer" }}>45</button>
            </span>
            <button type="button" style={{ padding: "6px 10px", border: "1px solid #e5e6e6", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#666" }}>→</button>
            <select style={{ padding: "6px 10px", border: "1px solid #e5e6e6", borderRadius: 6, background: "#fff", fontSize: 14, cursor: "pointer" }} defaultValue="200">
              <option value="50">50/page</option>
              <option value="100">100/page</option>
              <option value="200">200/page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
