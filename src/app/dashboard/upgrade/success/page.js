"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  
  const [status, setStatus] = useState("loading");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setCustomerEmail(data.customer_email);
      })
      .catch(() => {
        setStatus("error");
      });
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "linear-gradient(145deg, #0a0a0a, #111)" }}>
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <p className="text-neutral-400">Verifying payment...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6" style={{ background: "linear-gradient(145deg, #0a0a0a, #111)" }}>
        <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ background: "linear-gradient(180deg, #1a1a1a, #0d0d0d)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-neutral-400 mb-6">
            Welcome to NoteAG Pro! You now have unlimited access.
          </p>

          {customerEmail && (
            <div className="rounded-lg p-4 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs text-neutral-500 mb-1">Receipt sent to:</p>
              <p className="text-sm text-neutral-300 font-mono">{customerEmail}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 0 20px rgba(249,115,22,0.3)",
              }}
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => router.push("/workspace")}
              className="block w-full py-3 rounded-lg text-sm font-medium text-neutral-400 transition-all duration-200 hover:text-white hover:bg-white/5"
            >
              Start Uploading PDFs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6" style={{ background: "linear-gradient(145deg, #0a0a0a, #111)" }}>
      <div className="max-w-md w-full rounded-2xl p-8 text-center" style={{ background: "linear-gradient(180deg, #1a1a1a, #0d0d0d)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ef4444" }}>
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-neutral-400 mb-6">
          Something went wrong with your payment. Please try again.
        </p>

        <Link
          href="/dashboard/upgrade"
          className="block w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            boxShadow: "0 0 20px rgba(249,115,22,0.3)",
          }}
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
