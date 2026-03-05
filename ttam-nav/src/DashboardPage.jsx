import { useState } from "react";

const iconSvg = (path, props = {}) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {path}
  </svg>
);

const DocIcon = () => iconSvg(<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>);
const ExternalLinkIcon = () => iconSvg(<><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></>);
const ChevronLeftIcon = () => iconSvg(<path d="M15 18l-6-6 6-6" />);
const ChevronRightIcon = () => iconSvg(<path d="M9 18l6-6-6-6" />);

export default function DashboardPage() {
  const [updatesPage, setUpdatesPage] = useState(1);

  return (
    <div style={{ padding: "24px 40px 40px", background: "#fafafa", minHeight: "100%", position: "relative" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111" }}>Welcome to Ads Manager</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #e5e6e6",
              background: "#fff",
              color: "#111",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <DocIcon />
            Log
          </button>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#009995",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Create ad
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111" }}>Recommendations</h2>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#009995", textDecoration: "none", fontWeight: 500 }}>
            View all recommendations
            <ExternalLinkIcon />
          </a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #eee",
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8 }}>20%</div>
              <div style={{ width: 48, height: 6, background: "#e5e6e6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: "20%", height: "100%", background: "#f5c542", borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#111" }}>Account Optimization Program</h3>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: "#666", lineHeight: 1.4 }}>
                You have 2 key insights and recommendations tailored to your account.
              </p>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e5e6e6",
                  background: "#fff",
                  color: "#111",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                View insights
              </button>
            </div>
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #eee",
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "linear-gradient(135deg, #e6f7f7 0%, #ccefef 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#009995" strokeWidth={1.5}>
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#111" }}>Creatives</h3>
              <p style={{ margin: "0 0 16px", fontSize: 14, color: "#666", lineHeight: 1.4 }}>
                You might be spending unnecessary extra time on making videos.
              </p>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e5e6e6",
                  background: "#fff",
                  color: "#111",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Try Symphony
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Insights + Updates grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        {/* Insights */}
        <section>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600, color: "#111" }}>Insights</h2>

          <div style={{ marginBottom: 28 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#111" }}>Top ads on TikTok</h3>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#666", lineHeight: 1.4 }}>
              Discover the best performing ads in the past 7 days. Use the drop-down menu to view other metrics.{" "}
              <a href="#" style={{ color: "#009995", textDecoration: "none" }}>View more</a>
            </p>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    flexShrink: 0,
                    width: 140,
                    height: 180,
                    borderRadius: 8,
                    background: "#e5e6e6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  Ad {i}
                </div>
              ))}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#999" }}>Location: United States</p>
          </div>

          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#111" }}>Potential audience</h3>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#666", lineHeight: 1.4 }}>
              Find out more about the key audience from the past 7 days.{" "}
              <a href="#" style={{ color: "#009995", textDecoration: "none" }}>View more</a>
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <select
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e5e6e6",
                  background: "#fff",
                  fontSize: 14,
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                <option>Age</option>
              </select>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["25-34", "35-44", ">55", "45-54", "18-24"].map((label) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: "1px solid #e5e6e6",
                    background: "#f2f3f3",
                    fontSize: 14,
                    color: "#111",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Updates */}
        <section
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #eee",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #eee" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111" }}>Updates</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                type="button"
                onClick={() => setUpdatesPage((p) => Math.max(1, p - 1))}
                style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#666" }}
              >
                <ChevronLeftIcon />
              </button>
              <span style={{ fontSize: 14, color: "#666", minWidth: 48, textAlign: "center" }}>
                {updatesPage} / 3
              </span>
              <button
                type="button"
                onClick={() => setUpdatesPage((p) => Math.min(3, p + 1))}
                style={{ padding: 6, border: "none", background: "none", cursor: "pointer", color: "#666" }}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div
              style={{
                height: 140,
                borderRadius: 8,
                background: "linear-gradient(135deg, #e6f7f7 0%, #009995 50%, #ff8c42 100%)",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.5} style={{ opacity: 0.9 }}>
                <path d="M5 12l7-7 7 7M5 12h14" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "#111" }}>
              Upgrade to GMV Max to Amplify Your GMV Growth.
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e5e6e6",
                  background: "#fff",
                  color: "#111",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Try now
              </button>
              <a href="#" style={{ fontSize: 14, color: "#009995", textDecoration: "none", fontWeight: 500 }}>Learn more</a>
            </div>
          </div>
        </section>
      </div>

      {/* Floating action buttons */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 12, zIndex: 1000 }}>
        <button
          type="button"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "#5a4d7a",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          title="Feedback"
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" style={{ margin: "0 auto" }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </button>
        <button
          type="button"
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "#69b3f7",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
          title="Quick action"
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ margin: "0 auto" }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
