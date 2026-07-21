export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary, #000)",
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="tc-spinner" style={{
          width: 40, height: 40, margin: "0 auto 20px",
          border: "3px solid var(--border-color, rgba(255,255,255,0.1))",
          borderTopColor: "var(--text-primary, #f5f5f5)",
          borderRadius: "50%",
          animation: "tc-spin 0.8s linear infinite",
        }} />
        <p style={{
          fontSize: 13,
          color: "var(--text-secondary, #999)",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}>
          Memuat...
        </p>
        <style>{`
          @keyframes tc-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
