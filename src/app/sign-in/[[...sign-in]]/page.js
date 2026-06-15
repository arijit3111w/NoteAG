"use client";

import { SignIn } from "@clerk/nextjs";
import LampEffect from "@/components/ui/LampEffect";

export default function SignInPage() {
  return (
    <LampEffect>
      <div className="flex flex-col items-center gap-8">
        {/* Branding */}
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #fb923c, #f97316, #ea580c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NoteAG
          </h1>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base">
            Welcome back — sign in to continue
          </p>
        </div>

        {/* Clerk SignIn component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              cardBox: "shadow-none",
            },
          }}
        />

        {/* Shimmer decoration below */}
        <div
          className="w-48 h-[1px] mx-auto"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.5), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />
      </div>
    </LampEffect>
  );
}
