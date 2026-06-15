"use client";
import { useEffect, useRef, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import gsap from "gsap";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef([]);
  const ctaRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the entire navbar sliding down
      gsap.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      // Animate logo
      gsap.fromTo(
        logoRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.5 }
      );

      // Stagger animate nav links
      gsap.fromTo(
        linksRef.current.filter(Boolean),
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.6,
        }
      );

      // Animate CTA button
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: 1,
          }
        );
      }
    }, navRef);

    return () => ctx.revert();
  }, []);

  // Scroll listener for translucent effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP hover animation for nav links
  const handleLinkHover = (el, isEnter) => {
    if (!el) return;
    gsap.to(el, {
      color: isEnter ? "#f97316" : "#a3a3a3",
      y: isEnter ? -2 : 0,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
        style={{
          opacity: 0,
          backgroundColor: scrolled
            ? "rgba(10, 10, 10, 0.75)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(249, 115, 22, 0.1)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" ref={logoRef} className="flex items-center gap-2 shrink-0" style={{ opacity: 0 }}>
              <span
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #fb923c, #f97316, #ea580c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NOTE
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                AG
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  ref={(el) => (linksRef.current[i] = el)}
                  onMouseEnter={(e) => handleLinkHover(e.currentTarget, true)}
                  onMouseLeave={(e) => handleLinkHover(e.currentTarget, false)}
                  className="px-3 lg:px-4 py-2 text-sm font-medium uppercase tracking-widest transition-colors"
                  style={{ color: "#a3a3a3", opacity: 0 }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side: Auth + CTA */}
            <div
              ref={ctaRef}
              className="hidden md:flex items-center gap-3"
              style={{ opacity: 0 }}
            >
              <Show when="signed-out">
                <SignInButton>
                  <button className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button
                    className="px-5 py-2.5 text-sm font-medium rounded-full cursor-pointer transition-all duration-300 hover:shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #f97316, #ea580c)",
                      color: "#fff",
                      border: "1px solid rgba(249, 115, 22, 0.3)",
                      boxShadow: "0 0 15px rgba(249, 115, 22, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        boxShadow: "0 0 25px rgba(249, 115, 22, 0.4)",
                        scale: 1.05,
                        duration: 0.3,
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        boxShadow: "0 0 15px rgba(249, 115, 22, 0.2)",
                        scale: 1,
                        duration: 0.3,
                      });
                    }}
                  >
                    Get Started
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300"
                  style={{
                    border: "1px solid rgba(249, 115, 22, 0.4)",
                    color: "#f97316",
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      backgroundColor: "rgba(249, 115, 22, 0.1)",
                      duration: 0.3,
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      backgroundColor: "transparent",
                      duration: 0.3,
                    });
                  }}
                >
                  Dashboard
                </Link>
                <UserButton />
              </Show>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span
                className="block w-5 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#f97316",
                  transform: mobileOpen
                    ? "rotate(45deg) translateY(5px)"
                    : "none",
                }}
              />
              <span
                className="block w-5 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#f97316",
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-[2px] rounded-full transition-all duration-300"
                style={{
                  backgroundColor: "#f97316",
                  transform: mobileOpen
                    ? "rotate(-45deg) translateY(-5px)"
                    : "none",
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-500"
        style={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6 pt-16">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-medium uppercase tracking-widest transition-colors"
              style={{ color: "#a3a3a3" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#f97316")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#a3a3a3")
              }
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col items-center gap-4 mt-6">
            <Show when="signed-out">
              <SignInButton>
                <button className="px-6 py-3 text-base font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button
                  className="px-8 py-3 text-base font-medium rounded-full cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                    border: "1px solid rgba(249, 115, 22, 0.3)",
                    boxShadow: "0 0 15px rgba(249, 115, 22, 0.2)",
                  }}
                >
                  Get Started
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      </div>

      {/* Spacer so content doesn't hide behind the fixed navbar */}
      <div className="h-16 sm:h-18" />
    </>
  );
}
