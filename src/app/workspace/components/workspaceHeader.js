"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

/* ─── Cute SVG Animals ─── */
const OctopusSVG = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Body */}
    <ellipse cx="32" cy="22" rx="16" ry="14" fill="#f97316" opacity="0.9"/>
    {/* Eyes */}
    <circle cx="26" cy="20" r="3.5" fill="white"/>
    <circle cx="38" cy="20" r="3.5" fill="white"/>
    <circle cx="27" cy="20" r="1.8" fill="#1a1a2e"/>
    <circle cx="39" cy="20" r="1.8" fill="#1a1a2e"/>
    {/* Smile */}
    <path d="M28 27 Q32 31 36 27" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Tentacles */}
    <path d="M18 32 Q14 42 18 48" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M23 34 Q20 44 24 50" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M28 35 Q27 46 30 51" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M36 35 Q37 46 34 51" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M41 34 Q44 44 40 50" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M46 32 Q50 42 46 48" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    {/* Cheek blush */}
    <circle cx="22" cy="25" r="2.5" fill="#fb923c" opacity="0.4"/>
    <circle cx="42" cy="25" r="2.5" fill="#fb923c" opacity="0.4"/>
  </svg>
);

const SquirrelSVG = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Tail */}
    <path d="M12 14 Q6 8 10 18 Q8 28 16 24" stroke="#c2410c" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Body */}
    <ellipse cx="32" cy="36" rx="12" ry="10" fill="#ea580c" opacity="0.85"/>
    {/* Head */}
    <circle cx="42" cy="26" r="10" fill="#f97316"/>
    {/* Ear */}
    <path d="M36 16 L38 10 L42 16" fill="#c2410c"/>
    <path d="M44 16 L46 10 L50 16" fill="#c2410c"/>
    {/* Eye */}
    <circle cx="44" cy="24" r="2.5" fill="white"/>
    <circle cx="45" cy="24" r="1.2" fill="#1a1a2e"/>
    {/* Nose */}
    <circle cx="50" cy="27" r="1.5" fill="#7c2d12"/>
    {/* Legs */}
    <line x1="24" y1="44" x2="22" y2="52" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="30" y1="45" x2="28" y2="52" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="36" y1="45" x2="38" y2="52" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="40" y1="44" x2="42" y2="52" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Cheek */}
    <circle cx="48" cy="29" r="2" fill="#fb923c" opacity="0.4"/>
  </svg>
);

const DeerSVG = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Antlers */}
    <path d="M22 14 L18 4 L16 10" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M22 14 L20 6 L24 8" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M38 14 L42 4 L44 10" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M38 14 L40 6 L36 8" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Head */}
    <ellipse cx="30" cy="22" rx="12" ry="10" fill="#d97706"/>
    {/* Ears */}
    <ellipse cx="18" cy="16" rx="4" ry="6" fill="#d97706" transform="rotate(-20 18 16)"/>
    <ellipse cx="42" cy="16" rx="4" ry="6" fill="#d97706" transform="rotate(20 42 16)"/>
    <ellipse cx="18" cy="16" rx="2.5" ry="4" fill="#fbbf24" opacity="0.5" transform="rotate(-20 18 16)"/>
    <ellipse cx="42" cy="16" rx="2.5" ry="4" fill="#fbbf24" opacity="0.5" transform="rotate(20 42 16)"/>
    {/* Eyes */}
    <circle cx="24" cy="20" r="3" fill="white"/>
    <circle cx="36" cy="20" r="3" fill="white"/>
    <circle cx="25" cy="20" r="1.5" fill="#1a1a2e"/>
    <circle cx="37" cy="20" r="1.5" fill="#1a1a2e"/>
    {/* Eye shine */}
    <circle cx="25.5" cy="19" r="0.6" fill="white"/>
    <circle cx="37.5" cy="19" r="0.6" fill="white"/>
    {/* Nose */}
    <ellipse cx="30" cy="27" rx="3" ry="2" fill="#92400e"/>
    {/* Smile */}
    <path d="M27 29 Q30 32 33 29" stroke="#92400e" strokeWidth="1" fill="none" strokeLinecap="round"/>
    {/* Body */}
    <ellipse cx="30" cy="42" rx="14" ry="10" fill="#d97706" opacity="0.85"/>
    {/* Legs */}
    <line x1="20" y1="50" x2="18" y2="58" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="26" y1="51" x2="24" y2="58" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="34" y1="51" x2="36" y2="58" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="40" y1="50" x2="42" y2="58" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Spots */}
    <circle cx="24" cy="40" r="1.5" fill="#fbbf24" opacity="0.4"/>
    <circle cx="34" cy="38" r="1.5" fill="#fbbf24" opacity="0.4"/>
    <circle cx="28" cy="44" r="1" fill="#fbbf24" opacity="0.4"/>
  </svg>
);

const FoxSVG = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Ears */}
    <polygon points="16,8 22,24 10,24" fill="#ea580c"/>
    <polygon points="48,8 54,24 42,24" fill="#ea580c"/>
    <polygon points="17,12 21,22 13,22" fill="#fed7aa" opacity="0.6"/>
    <polygon points="47,12 51,22 43,22" fill="#fed7aa" opacity="0.6"/>
    {/* Head */}
    <ellipse cx="32" cy="28" rx="14" ry="12" fill="#f97316"/>
    {/* White face patch */}
    <ellipse cx="32" cy="32" rx="8" ry="8" fill="#fff7ed" opacity="0.7"/>
    {/* Eyes */}
    <circle cx="26" cy="26" r="2.5" fill="white"/>
    <circle cx="38" cy="26" r="2.5" fill="white"/>
    <circle cx="27" cy="26" r="1.3" fill="#1a1a2e"/>
    <circle cx="39" cy="26" r="1.3" fill="#1a1a2e"/>
    {/* Nose */}
    <circle cx="32" cy="31" r="2" fill="#1a1a2e"/>
    {/* Whiskers */}
    <line x1="20" y1="30" x2="10" y2="28" stroke="#d97706" strokeWidth="0.8" opacity="0.5"/>
    <line x1="20" y1="32" x2="10" y2="33" stroke="#d97706" strokeWidth="0.8" opacity="0.5"/>
    <line x1="44" y1="30" x2="54" y2="28" stroke="#d97706" strokeWidth="0.8" opacity="0.5"/>
    <line x1="44" y1="32" x2="54" y2="33" stroke="#d97706" strokeWidth="0.8" opacity="0.5"/>
    {/* Body */}
    <ellipse cx="32" cy="46" rx="12" ry="8" fill="#f97316" opacity="0.8"/>
    {/* Tail */}
    <path d="M44 44 Q56 38 54 48 Q52 54 46 50" fill="#ea580c"/>
    <path d="M52 47 Q50 52 46 49" fill="white" opacity="0.6"/>
    {/* Legs */}
    <line x1="24" y1="52" x2="22" y2="58" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="40" y1="52" x2="42" y2="58" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* ─── Running Animal Component ─── */
function RunningAnimal({ AnimalComponent, delay, duration, size, bottom }) {
  const animalRef = useRef(null);

  useEffect(() => {
    if (!animalRef.current) return;

    const tl = gsap.timeline({ repeat: -1, delay });

    // Bounce animation (subtle up-down while running)
    gsap.to(animalRef.current.querySelector(".animal-body"), {
      y: -4,
      duration: 0.25,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    // Run from left to right across the screen
    tl.fromTo(
      animalRef.current,
      { x: -100, opacity: 0 },
      { x: -40, opacity: 1, duration: 0.5, ease: "power2.out" }
    )
      .to(animalRef.current, {
        x: () => window.innerWidth + 100, // dynamically calculate width
        duration: duration,
        ease: "none",
      })
      .to(animalRef.current, { opacity: 0, duration: 0.5 }, "-=0.5");

    return () => tl.kill();
  }, [delay, duration]);

  return (
    <div
      ref={animalRef}
      className="absolute pointer-events-none"
      style={{ bottom: bottom || "0px", left: 0, opacity: 0, zIndex: 0 }}
    >
      <div className="animal-body">
        <AnimalComponent size={size} />
      </div>
    </div>
  );
}

/* ─── Workspace Header ─── */
export default function WorkspaceHeader({ fileName }) {
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="relative flex items-center justify-between px-4 sm:px-6 h-14 shrink-0 overflow-hidden"
      style={{
        opacity: 0,
        background: "linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(14,14,14,1) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ─── Animated Animals (Google Colab style) ─── */}
      <RunningAnimal AnimalComponent={OctopusSVG} delay={2} duration={18} size={24} bottom="4px" />
      <RunningAnimal AnimalComponent={SquirrelSVG} delay={8} duration={14} size={22} bottom="6px" />
      <RunningAnimal AnimalComponent={DeerSVG} delay={14} duration={22} size={26} bottom="2px" />
      <RunningAnimal AnimalComponent={FoxSVG} delay={20} duration={16} size={22} bottom="5px" />

      {/* ─── Left: Logo ─── */}
      <div className="flex items-center gap-3 z-10">
        <Link href="/dashboard" className="flex items-center gap-1.5 group">
          <span
            className="text-lg font-bold tracking-tight transition-all duration-300 group-hover:opacity-80"
            style={{
              background: "linear-gradient(135deg, #fb923c, #f97316, #ea580c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NOTE
          </span>
          <span className="text-lg font-bold tracking-tight text-white transition-all duration-300 group-hover:opacity-80">
            AG
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-700 mx-1" />

        {/* File name */}
        {fileName && (
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(249,115,22,0.5)" }}>
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            </svg>
            <span className="text-sm text-neutral-400 font-mono truncate max-w-[200px] sm:max-w-[300px]">
              {fileName}
            </span>
          </div>
        )}
      </div>

      {/* ─── Center: Subtle animated dots ─── */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          workspace
        </span>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-3 z-10">
        {/* Save indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#22c55e" }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-[11px] font-mono text-neutral-500">saved</span>
        </div>

        {/* Back to Dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 transition-all duration-200 hover:text-orange-400"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Dashboard
        </Link>

        {/* User avatar */}
        <UserButton />
      </div>
    </header>
  );
}
