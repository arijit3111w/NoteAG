"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function UpgradePage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  const shellRef = useRef(null);
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  const [loading, setLoading] = useState(false);
  
  // Check if user is already premium
  const isPremium = useQuery(
    api.subscriptions.isPremiumUser,
    userEmail ? { userEmail } : "skip"
  );
  
  const userSubscription = useQuery(
    api.subscriptions.getUserSubscription,
    userEmail ? { userEmail } : "skip"
  );

  /* ─── GSAP entrance animations ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        shellRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        sidebarRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.4 }
      );
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.3 }
      );
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.6 }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleUpgrade = async () => {
    if (!userEmail) {
      alert("Please sign in to upgrade");
      return;
    }
    
    // Prevent upgrade if already premium
    if (isPremium) {
      alert("You're already a Pro user!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert("Error: " + data.error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6" style={{ background: "linear-gradient(145deg, #0a0a0a, #111)" }}>
      {/* ═══ Terminal Window Shell ═══ */}
      <div
        ref={shellRef}
        className="w-full h-full max-w-[1600px] max-h-[960px] rounded-xl overflow-hidden flex flex-col"
        style={{
          opacity: 0,
          background: "linear-gradient(180deg, #1a1a1a, #0d0d0d)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* ─── MacBook Title Bar ─── */}
        <div
          ref={headerRef}
          className="flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{
            opacity: 0,
            background: "linear-gradient(180deg, #2a2a2a, #1e1e1e)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <button className="w-3 h-3 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: "#ff5f57" }} title="Close" />
            <button className="w-3 h-3 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: "#febc2e" }} title="Minimize" />
            <button className="w-3 h-3 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: "#28c840" }} title="Maximize" />
          </div>

          {/* Tab-style title */}
          <div className="flex items-center gap-2 px-4 py-1 rounded-md" style={{ background: "rgba(255,255,255,0.05)" }}>
            <span className="text-[11px] text-neutral-400 font-mono">NoteAG</span>
            <span className="text-[11px] text-neutral-600">—</span>
            <span className="text-[11px] text-neutral-500 font-mono">~/dashboard/upgrade</span>
          </div>

          {/* User button */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
              {user?.fullName || "User"}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* ─── Body: Sidebar + Main ─── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ═══ Sidebar ═══ */}
          <aside
            ref={sidebarRef}
            className="w-64 shrink-0 flex flex-col"
            style={{
              opacity: 0,
              background: "linear-gradient(180deg, #141414, #0e0e0e)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-col h-full p-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-1.5 mb-6 px-1 group">
                <span
                  className="text-xl font-bold transition-all group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #fb923c, #ea580c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  NOTE
                </span>
                <span className="text-xl font-bold text-white transition-all group-hover:scale-105">AG</span>
              </Link>

              {/* Upload PDF button */}
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white mb-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 0 15px rgba(249,115,22,0.2), 0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                + Upload PDF
              </Link>

              {/* Nav links */}
              <nav className="flex flex-col gap-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 transition-all duration-200 hover:text-white hover:bg-white/5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Workspace
                </Link>
                <Link
                  href="/dashboard/upgrade"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Upgrade
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              </nav>

              <div className="flex-1" />
            </div>
          </aside>

          {/* ═══ Main Content ═══ */}
          <main
            className="flex-1 overflow-y-auto p-6 sm:p-8"
            style={{ background: "linear-gradient(180deg, #111, #0a0a0a)" }}
          >
            <div ref={contentRef} style={{ opacity: 0 }}>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Upgrade to Pro
              </h1>
              <p className="text-neutral-500 text-sm mb-8 font-mono">
                ~/notes/{user?.firstName?.toLowerCase() || "user"}/upgrade
              </p>

              {!loading ? (
                <div className="max-w-2xl">
                  {isPremium ? (
                    // Already Pro - Show subscription info
                    <div
                      className="rounded-2xl p-8 mb-6"
                      style={{
                        background: "linear-gradient(145deg, rgba(16,185,129,0.08), rgba(20,20,20,0.9))",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <h2 className="text-2xl font-bold text-white">You're a Pro User!</h2>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <span className="text-neutral-400 text-sm">Status</span>
                          <span className="text-green-400 font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <span className="text-neutral-400 text-sm">Plan</span>
                          <span className="text-white font-semibold">{userSubscription?.planName || "NoteAG Pro"}</span>
                        </div>
                        {userSubscription?.currentPeriodEnd && (
                          <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                            <span className="text-neutral-400 text-sm">Next Billing Date</span>
                            <span className="text-white font-semibold">
                              {new Date(userSubscription.currentPeriodEnd * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-neutral-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>✨ Unlimited PDF uploads</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>✨ Unlimited AI questions</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>✨ Priority support</span>
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        className="block w-full py-3.5 rounded-lg text-base font-semibold text-white text-center transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          boxShadow: "0 0 20px rgba(16,185,129,0.3)",
                        }}
                      >
                        Back to Dashboard
                      </Link>

                      <p className="text-xs text-neutral-500 text-center mt-4">
                        To manage your subscription, visit your Stripe customer portal
                      </p>
                    </div>
                  ) : (
                    // Not Pro - Show upgrade option
                    <>
                      {/* Pricing Card */}
                  <div
                    className="rounded-2xl p-8 mb-6"
                    style={{
                      background: "linear-gradient(145deg, rgba(249,115,22,0.08), rgba(20,20,20,0.9))",
                      border: "1px solid rgba(249,115,22,0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316" }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <h2 className="text-2xl font-bold text-white">NoteAG Pro</h2>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">$4</span>
                        <span className="text-neutral-400 text-lg">/month</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-neutral-200">Unlimited PDF uploads</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-neutral-200">Unlimited AI questions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-neutral-200">Priority support</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-neutral-200">Advanced AI features</span>
                      </div>
                    </div>

                    <button
                      onClick={handleUpgrade}
                      disabled={loading || isPremium}
                      className="w-full py-3.5 rounded-lg text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: (loading || isPremium) ? "linear-gradient(135deg, #94a3b8, #64748b)" : "linear-gradient(135deg, #f97316, #ea580c)",
                        boxShadow: (loading || isPremium) ? "none" : "0 0 20px rgba(249,115,22,0.3)",
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Loading...
                        </span>
                      ) : isPremium ? (
                        "Already Subscribed"
                      ) : (
                        "Upgrade Now"
                      )}
                    </button>

                    <p className="text-xs text-neutral-500 text-center mt-4">
                      Cancel anytime • Secure payment via Stripe
                    </p>
                  </div>

                  {/* Free Plan Comparison */}
                  <div
                    className="rounded-xl p-6"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <h3 className="text-sm font-semibold text-neutral-400 mb-3">
                      Current Plan (Free)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-neutral-500 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Maximum 5 PDF uploads
                      </div>
                      <div className="flex items-center gap-3 text-neutral-500 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                        Limited AI questions
                      </div>
                    </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="max-w-2xl flex flex-col items-center justify-center py-20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316", animation: "spin 1s linear infinite", marginBottom: "16px" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <p className="text-neutral-400 text-sm">Redirecting to secure checkout...</p>
                </div>
              )}
            </div>
          </main>
        </div>
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
