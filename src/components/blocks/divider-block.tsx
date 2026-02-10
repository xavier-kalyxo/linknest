export function DividerBlock() {
  return (
    <hr
      className="w-full border-none"
      style={{
        height: "1px",
        backgroundColor: "var(--ln-border-color)",
        margin: `calc(var(--ln-spacing-unit) * 1) 0`,
      }}
    />
  );
}
