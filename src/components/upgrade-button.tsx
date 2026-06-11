"use client";
import { useState } from "react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
      }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
    >
      {loading ? "Aguarde..." : "Assinar Pro"}
    </button>
  );
}
