"use client";
import { useState } from "react";

export function UpgradeButton({ label = "Cadência Pro" }: { label?: string }) {
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={checkout}
      disabled={loading}
      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
    >
      {loading ? "Aguarde..." : label}
    </button>
  );
}
