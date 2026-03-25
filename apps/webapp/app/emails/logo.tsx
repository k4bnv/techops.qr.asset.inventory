import { Heading } from "@react-email/components";

export function LogoForEmail() {
  return (
    <div style={{ margin: "0 auto", display: "flex", alignItems: "center" }}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: "12px" }}
      >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
      <Heading
        as="h1"
        style={{
          color: "#111827",
          fontSize: "24px",
          fontWeight: "700",
          margin: "0",
          letterSpacing: "-0.025em",
        }}
      >
        TechOps
      </Heading>
    </div>
  );
}
