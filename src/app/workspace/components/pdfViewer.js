"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

/* ─── Styles ─── */
const viewerStyles = `
  .pdf-viewer-scroll {
    overflow-y: auto;
    height: 100%;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .pdf-viewer-scroll::-webkit-scrollbar { width: 6px; }
  .pdf-viewer-scroll::-webkit-scrollbar-track { background: transparent; }
  .pdf-viewer-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

  .pdf-page-wrap {
    position: relative;
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: visible;
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.3s ease;
  }
  
  .pdf-page-wrap.highlighted-page {
    border-color: rgba(249, 115, 22, 0.6) !important;
    box-shadow: 0 0 30px rgba(249, 115, 22, 0.3) !important;
    background: rgba(249, 115, 22, 0.05);
  }

  .react-pdf__Document {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .highlight-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.95), rgba(234, 88, 12, 0.95));
    color: white;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    animation: badgePulse 2s ease-in-out infinite;
    z-index: 10;
  }

  @keyframes badgePulse {
    0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.6); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

function PdfViewer({ fileUrl, searchQuery }) {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const [highlightedPage, setHighlightedPage] = useState(null);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const pageRefs = useRef({});
  const lastSearchQuery = useRef("");

  // ── Measure container width ──
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    console.log("[PdfViewer] PDF loaded with", n, "pages");
    setNumPages(n);
  }, []);

  // ── Simple search: just find which page contains the query ──
  useEffect(() => {
    if (!searchQuery || !numPages || searchQuery === lastSearchQuery.current) return;

    console.log("[PdfViewer] 🔍 Searching for:", searchQuery);
    lastSearchQuery.current = searchQuery;
    setHighlightedPage(null);

    // Wait a bit for text layers to render
    setTimeout(() => {
      const queryLower = searchQuery.toLowerCase().trim();
      
      // Search through all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pageEl = pageRefs.current[pageNum];
        if (!pageEl) continue;

        // Get all text from the page
        const textLayer = pageEl.querySelector(".react-pdf__Page__textContent");
        if (!textLayer) continue;

        const pageText = textLayer.textContent || "";
        
        if (pageText.toLowerCase().includes(queryLower)) {
          console.log("[PdfViewer] ✅ Found on page", pageNum);
          setHighlightedPage(pageNum);
          
          // Scroll to the page
          setTimeout(() => {
            pageEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 100);
          
          break;
        }
      }
    }, 2000);
  }, [searchQuery, numPages]);

  const pageWidth = containerWidth ? containerWidth - 24 : 500;

  return (
    <div ref={containerRef} className="w-full h-full">
      <style>{viewerStyles}</style>
      <div ref={scrollRef} className="pdf-viewer-scroll">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <svg
                  width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5"
                  style={{ color: "#f97316", animation: "spin 1s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span className="text-xs text-neutral-500">Loading PDF...</span>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-64">
              <span className="text-sm text-red-400">Failed to load PDF.</span>
            </div>
          }
        >
          {numPages &&
            Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
              const isHighlighted = highlightedPage === pageNum;
              
              return (
                <div
                  key={pageNum}
                  ref={(el) => (pageRefs.current[pageNum] = el)}
                  className={`pdf-page-wrap ${isHighlighted ? "highlighted-page" : ""}`}
                >
                  {isHighlighted && (
                    <div className="highlight-badge">
                      <span>📍</span>
                      <span>Answer Found Here</span>
                    </div>
                  )}
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </div>
              );
            })}
        </Document>

        {numPages && (
          <div className="text-center py-3" style={{ color: "#525252", fontSize: "11px" }}>
            {numPages} page{numPages !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfViewer;
