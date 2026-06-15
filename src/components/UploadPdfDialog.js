"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/* ─── Icons ─── */
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CloudUploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
    <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
  </svg>
);
const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

export default function UploadPdfDialog({
  isOpen,
  onClose,
  onUpload,
  uploading,
  uploadProgress,
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  /* ─── GSAP open / close animation ─── */
  useEffect(() => {
    if (isOpen) {
      // Animate in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.92, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.4)", delay: 0.05 }
      );
    }
  }, [isOpen]);

  const animateClose = () => {
    gsap.to(panelRef.current, {
      opacity: 0,
      scale: 0.92,
      y: 20,
      duration: 0.25,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setSelectedFile(null);
        setFileName("");
        onClose();
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name.replace(/\.pdf$/i, ""));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name.replace(/\.pdf$/i, ""));
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !fileName.trim()) return;
    onUpload(selectedFile, fileName.trim());
  };

  const isComplete = uploadProgress === 100;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ opacity: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current && !uploading) animateClose();
      }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1c1c1c, #111)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* ─── Terminal-style title bar ─── */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: "linear-gradient(180deg, #252525, #1e1e1e)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">
            upload — ~/workspace
          </span>
          <button
            onClick={() => !uploading && animateClose()}
            className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ─── Dialog body ─── */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-1">Upload PDF File</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Select a document to upload to your workspace
          </p>

          {/* ─── Drop zone ─── */}
          <div
            className="relative rounded-xl p-8 mb-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
            style={{
              border: dragOver
                ? "2px solid rgba(249,115,22,0.6)"
                : selectedFile
                  ? "2px solid rgba(249,115,22,0.3)"
                  : "2px dashed rgba(255,255,255,0.1)",
              background: dragOver
                ? "rgba(249,115,22,0.06)"
                : selectedFile
                  ? "rgba(249,115,22,0.03)"
                  : "rgba(255,255,255,0.02)",
              minHeight: "140px",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFile ? (
              <>
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
                >
                  <FileIcon />
                </div>
                <p className="text-sm font-semibold text-white truncate max-w-full">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-neutral-500 font-mono mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="mt-2 text-[11px] text-orange-400 hover:text-orange-300 underline underline-offset-2 cursor-pointer"
                >
                  Choose different file
                </button>
              </>
            ) : (
              <>
                <div className="mb-3" style={{ color: "rgba(249,115,22,0.4)" }}>
                  <CloudUploadIcon />
                </div>
                <p className="text-sm text-neutral-300 mb-1">
                  <span style={{ color: "#f97316" }} className="font-semibold">Click to browse</span>{" "}
                  or drag and drop
                </p>
                <p className="text-[11px] text-neutral-600 font-mono">
                  PDF files only • Max 10 MB
                </p>
              </>
            )}
          </div>

          {/* ─── File Name input ─── */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-neutral-400 mb-2">
              File Name <span style={{ color: "#f97316" }}>*</span>
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter a name for your document"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-all duration-200 focus:ring-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                focusRingColor: "#f97316",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(249,115,22,0.4)";
                e.target.style.boxShadow = "0 0 0 2px rgba(249,115,22,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* ─── Upload progress ─── */}
          {uploading && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">
                  {isComplete ? "Upload complete" : "Uploading..."}
                </span>
                <span className="text-xs font-mono" style={{ color: "#f97316" }}>
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    background: isComplete
                      ? "linear-gradient(90deg, #28c840, #22a838)"
                      : "linear-gradient(90deg, #f97316, #fb923c)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ─── Action buttons ─── */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => !uploading && animateClose()}
              disabled={uploading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white transition-all duration-200 disabled:opacity-40 cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || !fileName.trim() || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              style={{
                background: !selectedFile || !fileName.trim() || uploading
                  ? "rgba(249,115,22,0.3)"
                  : "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: !selectedFile || !fileName.trim() || uploading
                  ? "none"
                  : "0 0 15px rgba(249,115,22,0.25), 0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {isComplete ? (
                <>
                  <CheckIcon />
                  Done
                </>
              ) : uploading ? (
                "Uploading..."
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
