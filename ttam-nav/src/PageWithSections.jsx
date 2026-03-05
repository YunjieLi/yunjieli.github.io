const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  border: "1px solid #eee",
};

const sectionTitleStyle = { margin: "0 0 16px", fontSize: 18, fontWeight: 600, color: "#111" };
const bodyStyle = { margin: 0, fontSize: 14, color: "#666", lineHeight: 1.5 };

export default function PageWithSections({ title, subtitle, sections }) {
  return (
    <div style={{ padding: "24px 40px 40px", background: "#fafafa", minHeight: "100%" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111" }}>{title}</h1>
        {subtitle && <p style={{ margin: "8px 0 0", fontSize: 14, color: "#666" }}>{subtitle}</p>}
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {sections.map((section, i) => (
          <section key={i}>
            <h2 style={sectionTitleStyle}>{section.title}</h2>
            {Array.isArray(section.blocks) ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {section.blocks.map((block, j) => (
                  <div key={j} style={cardStyle}>
                    {block.title && <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#111" }}>{block.title}</h3>}
                    <p style={bodyStyle}>{block.body}</p>
                    {block.action && (
                      <button
                        type="button"
                        style={{
                          marginTop: 12,
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "1px solid #e5e6e6",
                          background: "#fff",
                          fontSize: 14,
                          color: "#111",
                          cursor: "pointer",
                        }}
                      >
                        {block.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={cardStyle}>
                {typeof section.body === "string" ? <p style={bodyStyle}>{section.body}</p> : section.body}
                {section.action && (
                  <button
                    type="button"
                    style={{
                      marginTop: 12,
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "1px solid #e5e6e6",
                      background: "#fff",
                      fontSize: 14,
                      color: "#111",
                      cursor: "pointer",
                    }}
                  >
                    {section.action}
                  </button>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
