"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DotGrid from "@/components/ui/DotGrid";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

gsap.registerPlugin(ScrollTrigger);

/* ─── tiny SVG icons for PDF + AI features ─── */
const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const BrainIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5"/></svg>
);
const HighlightIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
);
const DocumentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);
const EditorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
);
const ExportIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const features = [
  {
    icon: <UploadIcon />,
    title: "PDF Upload",
    desc: "Upload any PDF document and instantly access it in your workspace. Support for academic papers, textbooks, reports, and more.",
  },
  {
    icon: <BrainIcon />,
    title: "AI-Powered Q&A",
    desc: "Ask questions about your PDF and get instant answers powered by advanced AI. Your personal research assistant.",
  },
  {
    icon: <HighlightIcon />,
    title: "Smart Highlighting",
    desc: "AI answers show exactly where information comes from in your PDF with automatic page highlighting.",
  },
  {
    icon: <DocumentIcon />,
    title: "PDF Viewer",
    desc: "Beautiful, fast PDF viewer with zoom, navigation, and seamless integration with the AI assistant.",
  },
  {
    icon: <EditorIcon />,
    title: "Built-in Text Editor",
    desc: "Take notes alongside your PDFs with a powerful text editor. Capture insights as you learn.",
  },
  {
    icon: <ExportIcon />,
    title: "Export Your Work",
    desc: "Export your notes and insights anytime. Your research stays yours, always accessible.",
  },
];

const steps = [
  {
    num: "01",
    title: "Upload Your PDF",
    desc: "Sign up and upload any PDF document — research papers, textbooks, technical docs, or any PDF you want to study.",
  },
  {
    num: "02",
    title: "Ask Questions",
    desc: "Type any question about your PDF. Our AI reads the document and provides accurate answers with source citations.",
  },
  {
    num: "03",
    title: "Get AI Answers with Highlighting",
    desc: "Receive instant answers with automatic highlighting showing exactly where the information appears in your PDF.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Up to 5 PDFs", "Basic AI assistant", "PDF viewer & editor", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4",
    period: "/month",
    features: ["Unlimited PDFs", "Unlimited AI questions", "Advanced AI responses", "Source highlighting", "Priority support", "Export features"],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    user && checkUser();
  }, [user]);

  const checkUser = async () => {
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      imgUrl: user?.imageUrl,
      userName: user?.fullName,
    });
    console.log(result);
  };

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const featureCardsRef = useRef([]);
  const stepsRef = useRef(null);
  const stepCardsRef = useRef([]);
  const pricingRef = useRef(null);
  const pricingCardsRef = useRef([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ─── Hero entrance ─── */
      gsap.fromTo(
        ".hero-badge",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.3 }
      );
      gsap.fromTo(
        ".hero-title",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 }
      );
      gsap.fromTo(
        ".hero-subtitle",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.7 }
      );
      gsap.fromTo(
        ".hero-cta",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.9 }
      );
      gsap.fromTo(
        ".hero-scroll-indicator",
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 1.5 }
      );

      /* ─── Features section ─── */
      gsap.fromTo(
        ".features-heading",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
        }
      );

      featureCardsRef.current.filter(Boolean).forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
            delay: i * 0.1,
          }
        );
      });

      /* ─── Steps section — zoom-in scroll ─── */
      gsap.fromTo(
        ".steps-heading",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 80%",
          },
        }
      );

      stepCardsRef.current.filter(Boolean).forEach((card, i) => {
        gsap.fromTo(
          card,
          { scale: 0.75, opacity: 0, y: 100 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
            delay: i * 0.15,
          }
        );
      });

      /* ─── Pricing ─── */
      gsap.fromTo(
        ".pricing-heading",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pricingRef.current,
            start: "top 80%",
          },
        }
      );

      pricingCardsRef.current.filter(Boolean).forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0, rotateX: 8 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
            delay: i * 0.12,
          }
        );
      });

      /* ─── CTA zoom-in reveal ─── */
      gsap.fromTo(
        ctaRef.current,
        { scale: 0.85, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-black text-white overflow-x-hidden">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4"
      >
        {/* DotGrid Background */}
        <div className="absolute inset-0 z-0">
          <DotGrid
            dotSize={7}
            gap={15}
            baseColor="#1d1928"
            activeColor="#b64003"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>

        {/* Top radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "800px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center top, rgba(249,115,22,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-8 border"
            style={{
              opacity: 0,
              borderColor: "rgba(249,115,22,0.4)",
              color: "#f97316",
              backgroundColor: "rgba(249,115,22,0.06)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#f97316" }}
            />
            Introducing NoteAG
          </div>

          {/* Headline */}
          <h1
            className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6"
            style={{ opacity: 0 }}
          >
            <span className="block text-white">YOUR IDEAS,</span>
            <span
              className="block"
              style={{
                background:
                  "linear-gradient(135deg, #fb923c 0%, #f97316 40%, #ea580c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CAPTURED
            </span>
            <span className="block text-white">PERFECTLY.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ opacity: 0 }}
          >
            Upload any PDF and get instant AI-powered answers to your questions.
            Your intelligent reading companion with source highlighting and note-taking built in.
          </p>

          {/* CTA buttons */}
          <div
            className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ opacity: 0 }}
          >
            <Link
              href="/sign-up"
              className="group relative px-8 py-3.5 rounded-full text-base font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow:
                  "0 0 20px rgba(249,115,22,0.25), 0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              Start Writing — It&apos;s Free
              <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105"
              style={{
                border: "1px solid rgba(249,115,22,0.3)",
                color: "#f97316",
              }}
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: 0 }}>
          <div
            className="w-[1px] h-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(249,115,22,0.6), transparent)",
            }}
          />
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Scroll
          </span>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section
        ref={featuresRef}
        id="features"
        className="relative py-28 sm:py-36 px-4"
      >
        {/* Subtle section divider glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)",
          }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="features-heading text-center mb-16 sm:mb-20">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
              style={{
                color: "#f97316",
                border: "1px solid rgba(249,115,22,0.3)",
                backgroundColor: "rgba(249,115,22,0.05)",
              }}
            >
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #fb923c, #ea580c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                learn faster
              </span>
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto">
              Powerful AI features to help you understand PDFs, research papers, and documents with ease.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                ref={(el) => (featureCardsRef.current[i] = el)}
                className="group relative p-6 sm:p-8 rounded-2xl transition-all duration-500 hover:-translate-y-1"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(249,115,22,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))",
                    color: "#f97316",
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section
        ref={stepsRef}
        className="relative py-28 sm:py-36 px-4"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)",
          }}
        />

        <div className="max-w-5xl mx-auto">
          <div className="steps-heading text-center mb-16 sm:mb-20">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
              style={{
                color: "#f97316",
                border: "1px solid rgba(249,115,22,0.3)",
                backgroundColor: "rgba(249,115,22,0.05)",
              }}
            >
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Get started in{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #fb923c, #ea580c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                three simple steps
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-8 sm:gap-10">
            {steps.map((s, i) => (
              <div
                key={s.num}
                ref={(el) => (stepCardsRef.current[i] = el)}
                className="relative flex flex-col sm:flex-row items-start gap-6 p-8 sm:p-10 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9))",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Step number */}
                <div
                  className="text-5xl sm:text-6xl font-black shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.08))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.num}
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {s.title}
                  </h3>
                  <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-lg">
                    {s.desc}
                  </p>
                </div>

                {/* Connector line (not on last item) */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden sm:block absolute -bottom-10 left-16 w-[1px] h-10"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(249,115,22,0.3), transparent)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section
        ref={pricingRef}
        id="pricing"
        className="relative py-28 sm:py-36 px-4"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)",
          }}
        />

        <div className="max-w-5xl mx-auto">
          <div className="pricing-heading text-center mb-16 sm:mb-20">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest mb-4"
              style={{
                color: "#f97316",
                border: "1px solid rgba(249,115,22,0.3)",
                backgroundColor: "rgba(249,115,22,0.05)",
              }}
            >
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple,{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #fb923c, #ea580c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                transparent
              </span>{" "}
              pricing
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto">
              Start free. Upgrade when you are ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto" style={{ perspective: "1000px" }}>
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                ref={(el) => (pricingCardsRef.current[i] = el)}
                className="relative p-8 rounded-2xl flex flex-col"
                style={{
                  background: plan.highlighted
                    ? "linear-gradient(145deg, rgba(30,18,8,0.95), rgba(15,10,5,0.98))"
                    : "linear-gradient(145deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9))",
                  border: plan.highlighted
                    ? "1px solid rgba(249,115,22,0.35)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: plan.highlighted
                    ? "0 0 40px rgba(249,115,22,0.08)"
                    : "none",
                }}
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      color: "#fff",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-neutral-500 text-sm mb-1">
                    {plan.period}
                  </span>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-sm text-neutral-300"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className="block text-center py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
                  style={
                    plan.highlighted
                      ? {
                          background:
                            "linear-gradient(135deg, #f97316, #ea580c)",
                          color: "#fff",
                          boxShadow:
                            "0 0 15px rgba(249,115,22,0.25)",
                        }
                      : {
                          border: "1px solid rgba(249,115,22,0.3)",
                          color: "#f97316",
                        }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════ */}
      <section className="relative py-28 sm:py-36 px-4">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)",
          }}
        />

        <div
          ref={ctaRef}
          className="max-w-3xl mx-auto text-center relative p-12 sm:p-16 rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(25,15,8,0.9), rgba(10,6,3,0.95))",
            border: "1px solid rgba(249,115,22,0.2)",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
            }}
          />

          <h2 className="relative text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ready to{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #fb923c, #ea580c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              supercharge
            </span>{" "}
            your reading?
          </h2>
          <p className="relative text-neutral-400 text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Join students and researchers who learn faster with AI.
            Start for free, no credit card required.
          </p>
          <Link
            href="/sign-up"
            className="relative inline-flex items-center gap-2 px-10 py-4 rounded-full text-base font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow:
                "0 0 25px rgba(249,115,22,0.3), 0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            Get Started for Free
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer
        className="relative py-12 px-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #fb923c, #ea580c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NOTE
            </span>
            <span className="text-lg font-bold text-white">AG</span>
          </div>
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} NoteAG. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-neutral-500 hover:text-orange-500 text-sm transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-neutral-500 hover:text-orange-500 text-sm transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-neutral-500 hover:text-orange-500 text-sm transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
