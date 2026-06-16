"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UploadPdfDialog from "@/components/UploadPdfDialog";

const MAX_FREE_PDFS = 5;

/* ─── SVG Icons ─── */
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
  </svg>
);
const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const FileTextIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="10" y1="13" x2="16" y2="13"/><line x1="10" y1="17" x2="14" y2="17"/><line x1="10" y1="9" x2="12" y2="9"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default function DashboardPage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const router = useRouter();

  /* ─── Convex queries & mutations ─── */
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const addPdfFile = useMutation(api.fileStorage.addPdfFile);
  const ingestAction = useAction(api.myAction.ingest);
  const userFiles = useQuery(
    api.fileStorage.getUserFiles,
    userEmail ? { userEmail } : "skip"
  );
  const fileCount = useQuery(
    api.fileStorage.getFileCount,
    userEmail ? { userEmail } : "skip"
  );
  const isPremium = useQuery(
    api.subscriptions.isPremiumUser,
    userEmail ? { userEmail } : "skip"
  );

  /* ─── Local state ─── */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else {
        setSidebarOpen(false);
        if (sidebarRef.current) {
          gsap.set(sidebarRef.current, { clearProps: "transform" });
        }
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ─── Refs for GSAP ─── */
  const shellRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  const cardRefs = useRef([]);
  const headerRef = useRef(null);
  const titleRef = useRef(null);

  /* ─── GSAP entrance animations ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        shellRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );
      // Only animate sidebar on desktop — on mobile it uses CSS transform
      if (window.innerWidth >= 768 && sidebarRef.current) {
        gsap.fromTo(
          sidebarRef.current,
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.4 }
        );
      }
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.3 }
      );
      gsap.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.6 }
      );
    });
    return () => ctx.revert();
  }, []);

  /* ─── Animate file cards when data loads ─── */
  useEffect(() => {
    if (!userFiles) return;
    const validCards = cardRefs.current.filter(Boolean);
    if (validCards.length === 0) return;
    gsap.fromTo(
      validCards,
      { y: 40, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out", stagger: 0.08 }
    );
  }, [userFiles]);

  /* ─── Open dialog handler ─── */
  const openUploadDialog = () => {
    if (!userEmail) return;
    
    // Premium users have unlimited uploads
    if (isPremium) {
      setDialogOpen(true);
      return;
    }
    
    // Free users limited to 5 PDFs
    if ((fileCount ?? 0) >= MAX_FREE_PDFS) {
      alert("You've reached the free limit of 5 PDFs. Upgrade to Pro for unlimited uploads!");
      router.push("/dashboard/upgrade");
      return;
    }
    
    setDialogOpen(true);
  };

  /* ─── Actual upload handler (called from dialog) ─── */
  const handleUpload = async (file, customName) => {
    if (!userEmail) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 12, 70));
      }, 250);

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      clearInterval(progressInterval);
      setUploadProgress(75);

      // Save metadata with custom file name
      const fileId = crypto.randomUUID();
      const fileUrl = await addPdfFile({
        fileId,
        fileName: customName + ".pdf",
        storageId: storageId,
        createdBy: userEmail,
      });

      setUploadProgress(80);

      // Extract text from the uploaded PDF and generate embeddings
      console.log("Extracting text from PDF...");
      const res = await fetch(`/api/pdf-loader?pdfUrl=${encodeURIComponent(fileUrl)}`);
      const data = await res.json();

      setUploadProgress(90);

      if (data.result && data.result.length > 0) {
        console.log(`Ingesting ${data.result.length} chunks into Convex...`);
        await ingestAction({
          splitText: data.result,
          fileId: fileId,
        });
        console.log("Embeddings saved successfully!");
      }

      setUploadProgress(100);

      // Auto-close after success
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setDialogOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /* ─── Handle file card click ─── */
  const handleFileClick = (file) => {
    console.log("Clicked file:", file.fileName, file.fileId);
    router.push(`/workspace/${file.fileId}`);
  };
  const usedCount = fileCount ?? 0;
  const progressPercent = isPremium ? 0 : (usedCount / MAX_FREE_PDFS) * 100;

  return (
    <>
      {/* Upload PDF Dialog */}
      <UploadPdfDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onUpload={handleUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

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
              <span className="text-[11px] text-neutral-500 font-mono">~/dashboard</span>
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
            {/* ═══ Mobile Sidebar Backdrop ═══ */}
            {isMobile && sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* ═══ Sidebar ═══ */}
            <aside
              ref={sidebarRef}
              className={`${
                isMobile
                  ? `fixed top-0 left-0 z-50 h-full w-64 transition-transform duration-300 ${
                      sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`
                  : `${sidebarOpen ? "w-64" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden`
              } flex flex-col`}
              style={{
                opacity: isMobile ? 1 : 0,
                background: "linear-gradient(180deg, #141414, #0e0e0e)",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex flex-col h-full p-4 min-w-[256px]">
                {/* Header (Logo + Close Button) */}
                <div className="flex items-center justify-between mb-6">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-1.5 px-1 group">
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

                  {/* Mobile close button */}
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors md:hidden"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Upload PDF button — opens dialog */}
                <button
                  onClick={openUploadDialog}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-white mb-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    boxShadow: "0 0 15px rgba(249,115,22,0.2), 0 2px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  <UploadIcon />
                  + Upload PDF
                </button>

                {/* Nav links */}
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
                  >
                    <FolderIcon />
                    Workspace
                  </Link>
                  <Link
                    href="/dashboard/upgrade"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 transition-all duration-200 hover:text-white hover:bg-white/5"
                  >
                    <StarIcon />
                    Upgrade
                    <ChevronIcon />
                  </Link>
                </nav>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom: Usage progress */}
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: isPremium 
                      ? "linear-gradient(145deg, rgba(16,185,129,0.08), rgba(20,20,20,0.8))"
                      : "linear-gradient(145deg, rgba(249,115,22,0.06), rgba(20,20,20,0.8))",
                    border: isPremium
                      ? "1px solid rgba(16,185,129,0.15)"
                      : "1px solid rgba(249,115,22,0.12)",
                  }}
                >
                  {isPremium ? (
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#10b981" }}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span className="text-xs font-semibold" style={{ color: "#10b981" }}>
                          PRO
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Unlimited uploads
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-neutral-300">Storage</span>
                        <span className="text-xs font-mono" style={{ color: "#f97316" }}>
                          {usedCount}/{MAX_FREE_PDFS}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${progressPercent}%`,
                            background: progressPercent >= 80
                              ? "linear-gradient(90deg, #ef4444, #dc2626)"
                              : "linear-gradient(90deg, #f97316, #fb923c)",
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-2">
                        {usedCount} PDF{usedCount !== 1 ? "s" : ""} out of {MAX_FREE_PDFS} uploaded
                      </p>
                    </>
                  )}
                </div>
              </div>
            </aside>

            {/* ═══ Main Content ═══ */}
            <main
              ref={mainRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8"
              style={{ background: "linear-gradient(180deg, #111, #0a0a0a)" }}
            >
              {/* Toggle sidebar on mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mb-4 p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              {/* Heading */}
              <div ref={titleRef} style={{ opacity: 0 }}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Workspace
                </h1>
                <p className="text-neutral-500 text-sm mb-8 font-mono">
                  ~/notes/{user?.firstName?.toLowerCase() || "user"}/workspace
                </p>
              </div>

              {/* File Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {/* Upload Card (always first) */}
                <div
                  ref={(el) => (cardRefs.current[0] = el)}
                  onClick={openUploadDialog}
                  className="group flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    minHeight: "200px",
                    border: "2px dashed rgba(249,115,22,0.25)",
                    background: "rgba(249,115,22,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)";
                    e.currentTarget.style.background = "rgba(249,115,22,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)";
                    e.currentTarget.style.background = "rgba(249,115,22,0.02)";
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: "rgba(249,115,22,0.1)",
                      color: "#f97316",
                    }}
                  >
                    <PlusIcon />
                  </div>
                  <span className="text-sm font-medium text-neutral-400 group-hover:text-orange-400 transition-colors">
                    Upload PDF
                  </span>
                </div>

                {/* File Cards */}
                {userFiles?.map((file, i) => (
                  <div
                    key={file._id}
                    ref={(el) => (cardRefs.current[i + 1] = el)}
                    onClick={() => handleFileClick(file)}
                    className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
                    style={{
                      background: "linear-gradient(145deg, rgba(22,22,22,0.95), rgba(14,14,14,0.98))",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(249,115,22,0.2)";
                      e.currentTarget.style.boxShadow = "0 8px 30px rgba(249,115,22,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* File preview area */}
                    <div
                      className="flex items-center justify-center py-10 px-6"
                      style={{ background: "rgba(249,115,22,0.03)" }}
                    >
                      <div style={{ color: "rgba(249,115,22,0.5)" }}>
                        <FileTextIcon />
                      </div>
                    </div>

                    {/* File info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white truncate mb-1 group-hover:text-orange-300 transition-colors">
                        {file.fileName}
                      </h3>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {new Date(file.uploadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {userFiles && userFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-16 text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(249,115,22,0.06)",
                      color: "rgba(249,115,22,0.3)",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-300 mb-1">
                    No PDFs yet
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-xs">
                    Upload your first PDF to get started. Click the button above or drag and drop.
                  </p>
                </div>
              )}

              {/* Terminal-style status bar at bottom */}
              <div
                className="mt-10 px-4 py-2.5 rounded-lg flex items-center justify-between"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#28c840" }} />
                    connected
                  </span>
                  <span className="text-[11px] font-mono text-neutral-600">
                    {usedCount} file{usedCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-neutral-600">
                    convex v1.0
                  </span>
                  <span className="text-[11px] font-mono text-neutral-600">
                    UTF-8
                  </span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
