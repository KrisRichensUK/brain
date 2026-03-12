import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <main style={{ fontFamily: "sans-serif", margin: 24 }}>
      <h1>Proof-of-Access Admin</h1>
      <p>Configure source connectors and composite logic trees for each venue.</p>
      <pre>
{JSON.stringify({
  connector: { type: "postgres", name: "memberships-db" },
  logicTree: {
    op: "AND",
    children: [
      { source: "membership", field: "valid", equals: true },
      { source: "blacklist", field: "blocked", equals: false }
    ]
  }
}, null, 2)}
      </pre>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
