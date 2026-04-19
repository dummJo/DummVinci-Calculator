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
        <img src="/dummjo-icon.svg" alt="DummVinci" width={32} height={32} style={{ borderRadius: 6 }} />
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-md)",
          color: "var(--accent)",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
        }}>
          DummVinci Calculator
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
