import ThemeToggle from "@/components/ThemeToggle";

export default function TopBar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90,
        height: "var(--nav-height)",
        background: "var(--nav-bg)",
        backdropFilter: "var(--nav-blur)",
        WebkitBackdropFilter: "var(--nav-blur)",
        borderBottom: "1px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="DummVinci" width={28} height={28} style={{ opacity: 0.9 }} />
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-md)",
            color: "var(--accent)",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}>
            DummVinci Calculator
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--muted)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            Engineered by dummJo
          </div>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
