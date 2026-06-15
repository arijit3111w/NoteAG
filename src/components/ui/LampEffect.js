"use client";
import { useEffect, useState } from "react";

export default function LampEffect({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the initial render completes before triggering transitions
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black w-full">
      {/* Grid background */}
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(249, 115, 22, 0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: mounted ? 0.4 : 0,
        }}
      />

      {/* Radial dot grid overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out delay-500"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(249, 115, 22, 0.08) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
          opacity: mounted ? 0.3 : 0,
        }}
      />

      {/* Lamp cone of light */}
      <div className="relative flex w-full flex-1 items-center justify-center">
        {/* Main lamp glow - conic gradient */}
        <div
          className="absolute top-0 left-1/2 transition-all duration-[2000ms] ease-out"
          style={{
            width: "clamp(500px, 70vw, 1000px)",
            height: "clamp(400px, 60vh, 700px)",
            background: `conic-gradient(from 180deg at 50% 0%, transparent 28%, rgba(249, 115, 22, 0.08) 40%, rgba(249, 115, 22, 0.2) 50%, rgba(249, 115, 22, 0.08) 60%, transparent 72%)`,
            transform: mounted
              ? "translateX(-50%) translateY(0) scale(1)"
              : "translateX(-50%) translateY(-30px) scale(0.5)",
            opacity: mounted ? 1 : 0,
          }}
        />

        {/* Lamp source bar - glowing orange line at top */}
        <div
          className="absolute top-0 left-1/2 h-[2px] transition-all duration-[2000ms] ease-in-out"
          style={{
            width: "clamp(200px, 30vw, 400px)",
            background: `linear-gradient(90deg, transparent, #f97316, #fb923c, #f97316, transparent)`,
            boxShadow: `0 0 20px rgba(249, 115, 22, 0.6), 0 0 60px rgba(249, 115, 22, 0.3), 0 0 100px rgba(249, 115, 22, 0.15)`,
            transform: mounted
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(-20px)",
            opacity: mounted ? 1 : 0,
          }}
        />

        {/* Large ambient glow orb */}
        <div
          className="absolute top-[8%] left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: "clamp(300px, 45vw, 650px)",
            height: "clamp(200px, 30vh, 400px)",
            background: `radial-gradient(ellipse at center, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.04) 40%, transparent 70%)`,
            animation: mounted ? "pulse-glow 4s ease-in-out infinite" : "none",
          }}
        />

        {/* Floating accent orb left */}
        <div
          className="absolute top-[5%] left-[42%] -translate-x-1/2 rounded-full"
          style={{
            width: "200px",
            height: "200px",
            background: `radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 70%)`,
            animation: mounted ? "float 6s ease-in-out infinite" : "none",
          }}
        />

        {/* Floating accent orb right */}
        <div
          className="absolute top-[12%] left-[58%] -translate-x-1/2 rounded-full"
          style={{
            width: "150px",
            height: "150px",
            background: `radial-gradient(circle, rgba(234, 88, 12, 0.06) 0%, transparent 70%)`,
            animation: mounted ? "float 7s ease-in-out infinite reverse" : "none",
          }}
        />

        {/* Content area */}
        <div
          className="relative z-10 transition-all duration-[800ms] ease-out delay-500"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(30px)",
          }}
        >
          {children}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(to top, black, transparent)`,
        }}
      />
    </div>
  );
}
