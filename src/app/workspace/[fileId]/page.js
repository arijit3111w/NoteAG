"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import WorkspaceHeader from "../components/workspaceHeader";

// Dynamic imports to prevent SSR issues with browser-only libraries
const PdfViewer = dynamic(() => import("../components/pdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <svg
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5"
          style={{ color: "#f97316", animation: "spin 1s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-xs text-neutral-500">Loading PDF Viewer...</span>
      </div>
    </div>
  ),
});

const TextEditor = dynamic(() => import("../components/textEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-neutral-500">Loading Editor...</p>
    </div>
  ),
});

export default function Workspace() {
  const { fileId } = useParams();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  
  // State to hold the search query from the AI response
  const [pdfSearchQuery, setPdfSearchQuery] = useState("");
  // Mobile tab: "editor" or "pdf"
  const [activeTab, setActiveTab] = useState("editor");

  // Query file info from Convex using fileId
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, {
    fileId: fileId,
  });

  useEffect(() => {
    console.log(fileInfo);
  }, [fileInfo]);

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0a0a0a" }}>
      {/* ─── Workspace Header ─── */}
      <WorkspaceHeader fileName={fileInfo?.fileName} />

      {/* ─── Mobile Tab Switcher ─── */}
      <div
        className="flex md:hidden shrink-0"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <button
          onClick={() => setActiveTab("editor")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors"
          style={{
            color: activeTab === "editor" ? "#f97316" : "#737373",
            borderBottom: activeTab === "editor" ? "2px solid #f97316" : "2px solid transparent",
            background: activeTab === "editor" ? "rgba(249,115,22,0.05)" : "transparent",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.854z"/>
          </svg>
          Editor
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors"
          style={{
            color: activeTab === "pdf" ? "#f97316" : "#737373",
            borderBottom: activeTab === "pdf" ? "2px solid #f97316" : "2px solid transparent",
            background: activeTab === "pdf" ? "rgba(249,115,22,0.05)" : "transparent",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
          </svg>
          PDF
        </button>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left Panel: Text Editor / Chat UI ─── */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${activeTab !== "editor" ? "hidden md:flex" : ""}`}
          style={{
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Editor Content Area */}
          <div className="flex-1 overflow-hidden">
            <TextEditor fileId={fileId} onHighlightPdf={setPdfSearchQuery} />
          </div>
        </div>

        {/* ─── Right Panel: PDF Viewer ─── */}
        <div className={`flex-1 flex flex-col overflow-hidden ${activeTab !== "pdf" ? "hidden md:flex" : ""}`}>
          {/* Panel Header */}
          <div
            className="hidden md:flex items-center justify-between px-4 py-2.5 shrink-0"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f97316" }}>
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
              </svg>
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                PDF Viewer
              </span>
            </div>
          </div>

          {/* PDF Viewer Content */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            {fileInfo?.fileUrl ? (
              <PdfViewer fileUrl={fileInfo.fileUrl} searchQuery={pdfSearchQuery} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(249,115,22,0.06)",
                    color: "rgba(249,115,22,0.3)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  </svg>
                </div>
                <p className="text-sm text-neutral-500">Loading PDF...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
