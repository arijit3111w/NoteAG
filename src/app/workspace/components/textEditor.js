"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import html2pdf from "html2pdf.js";

const lowlight = createLowlight(common);

/* ─── Download Helpers ─── */
function downloadAsPDF(editor, filename) {
  const html = editor.getHTML();
  
  // Create a container with styles for the PDF rendering
  const element = document.createElement("div");
  element.innerHTML = `
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; color: #222; line-height: 1.6; }
      h1 { font-size: 24pt; margin-top: 12pt; margin-bottom: 6pt; }
      h2 { font-size: 18pt; margin-top: 10pt; margin-bottom: 4pt; }
      h3 { font-size: 14pt; margin-top: 8pt; margin-bottom: 4pt; }
      p { margin-bottom: 10pt; }
      pre { background: #f4f4f5; padding: 12pt; border-radius: 6pt; overflow-x: auto; }
      code { font-family: 'Courier New', Courier, monospace; background: #fff7ed; padding: 2pt 4pt; border-radius: 3pt; color: #c2410c; }
      pre code { background: transparent; padding: 0; color: #222; }
      mark { background: #ffedd5; padding: 2pt 4pt; border-radius: 3pt; }
      a { color: #f97316; text-decoration: none; }
      blockquote { border-left: 4pt solid #f97316; padding-left: 12pt; margin-left: 0; color: #555; font-style: italic; }
      ul, ol { padding-left: 20pt; margin-bottom: 10pt; }
      li { margin-bottom: 4pt; }
    </style>
    <div style="padding: 20px;">
      ${html}
    </div>
  `;

  const finalName = filename.trim() ? (filename.trim().endsWith('.pdf') ? filename.trim() : `${filename.trim()}.pdf`) : 'NoteAG-Document.pdf';

  const opt = {
    margin:       0.5,
    filename:     finalName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
}

/* ─── Download Dialog ─── */
function DownloadDialog({ isOpen, onClose, onSave }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);
  const [filename, setFilename] = useState("NoteAG-Document");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    gsap.to(dialogRef.current, {
      opacity: 0, scale: 0.9, y: 10, duration: 0.2, ease: "power2.in"
    });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.2, ease: "power2.in", onComplete: onClose
    });
  };

  const handleSave = () => {
    onSave(filename);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", opacity: 0 }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(180deg, #18181b 0%, #0f0f11 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: 0
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-2">Save PDF</h3>
        <p className="text-sm text-neutral-400 mb-5">Give your document a name before downloading.</p>
        
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all mb-6"
          placeholder="Document name"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toolbar ─── */
function EditorToolbar({ editor, onOpenDownload, onHighlightPdf }) {
  const { fileId } = useParams();
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const SearchAI = useAction(api.myAction.search);
  const [isAiLoading, setIsAiLoading] = useState(false);

  /* Convert markdown-ish AI response → HTML for Tiptap */
  function markdownToHtml(md) {
    let processedMd = md;
    
    // Convert LaTeX math to readable Unicode (handles both \times and \\times)
    const convertMath = (latex) => {
      return latex
        // Normalize double backslashes from JSON parsing
        .replace(/\\\\/g, '\\')
        // Functions
        .replace(/\\text\s*\{([^}]+)\}/g, '$1')
        .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1/$2')
        // Operators
        .replace(/\\times\b/g, '×')
        .replace(/\\cdot\b/g, '·')
        .replace(/\\div\b/g, '÷')
        .replace(/\\pm\b/g, '±')
        .replace(/\\approx\b/g, '≈')
        .replace(/\\leq\b/g, '≤')
        .replace(/\\geq\b/g, '≥')
        .replace(/\\neq\b/g, '≠')
        .replace(/\\sum(?![a-zA-Z])/g, 'Σ')
        .replace(/\\int(?![a-zA-Z])/g, '∫')
        // Greek letters
        .replace(/\\alpha\b/g, 'α')
        .replace(/\\beta\b/g, 'β')
        .replace(/\\gamma\b/g, 'γ')
        .replace(/\\delta\b/g, 'δ')
        .replace(/\\epsilon\b/g, 'ε')
        .replace(/\\theta\b/g, 'θ')
        .replace(/\\lambda\b/g, 'λ')
        .replace(/\\mu\b/g, 'μ')
        .replace(/\\sigma\b/g, 'σ')
        .replace(/\\phi\b/g, 'φ')
        .replace(/\\pi\b/g, 'π')
        .replace(/\\rho\b/g, 'ρ')
        .replace(/\\Delta\b/g, 'Δ')
        .replace(/\\Sigma\b/g, 'Σ')
        // Superscripts
        .replace(/\^(\d)/g, (m, n) => {
          const map = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
          return map[n] || `^${n}`;
        })
        // Subscripts
        .replace(/_(\d)/g, (m, n) => {
          const map = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
          return map[n] || `_${n}`;
        })
        // Hat accent
        .replace(/\\hat\{([^}]+)\}/g, '$1̂')
        // Braces
        .replace(/\{([^}]+)\}/g, '$1')
        // Remove leftover backslashes
        .replace(/\\/g, '');
    };

    // Block math: $$...$$
    processedMd = processedMd.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      return `<p><strong>${convertMath(math).trim()}</strong></p>`;
    });
    
    // Inline math: $...$
    processedMd = processedMd.replace(/\$([^$\n]+?)\$/g, (match, math) => {
      return convertMath(math);
    });

    // Split into blocks separated by code fences
    const parts = processedMd.split(/(```[\s\S]*?```)/g);
    let html = "";
    for (const part of parts) {
      const codeMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (codeMatch) {
        const lang = codeMatch[1] || "plaintext";
        const code = codeMatch[2].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html += `<pre><code class="language-${lang}">${code}</code></pre>`;
      } else {
        // Convert inline markdown to HTML
        let text = part
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, '<code>$1</code>');

        // Convert bullet lines
        const lines = text.split("\n");
        let inList = false;
        let result = "";
        for (const line of lines) {
          const bulletMatch = line.match(/^[\s]*[-•]\s+(.*)/);
          if (bulletMatch) {
            if (!inList) { result += "<ul>"; inList = true; }
            result += `<li>${bulletMatch[1]}</li>`;
          } else {
            if (inList) { result += "</ul>"; inList = false; }
            if (line.trim()) result += `<p>${line}</p>`;
          }
        }
        if (inList) result += "</ul>";
        html += result;
      }
    }
    return html;
  }

  const onAiClick = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (!selectedText.trim()) {
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await SearchAI({ query: selectedText, fileId: fileId });
      const parsed = JSON.parse(result);
      const answerHtml = markdownToHtml(parsed.answer);

      // Trigger the PDF viewer to highlight the source text
      if (parsed.highlightQuery && onHighlightPdf) {
        console.log("Sending highlight query to PDF:", parsed.highlightQuery);
        onHighlightPdf(parsed.highlightQuery);
      }

      // Insert AI answer block right after the selected text
      editor
        .chain()
        .setTextSelection(to) // Move cursor to the end of the selection
        .insertContent("<hr>")
        .insertContent('<p><strong style="color:#a855f7">Ans:</strong></p>')
        .insertContent(answerHtml)
        .insertContent("<hr>")
        .focus()
        .run();
    } catch (err) {
      console.error("AI search failed:", err);
      editor
        .chain()
        .focus("end")
        .insertContent("<hr>")
        .insertContent('<p><strong style="color:#ef4444">⚠️ AI Error:</strong> Failed to get a response. Please try again.</p>')
        .insertContent("<hr>")
        .run();
    } finally {
      setIsAiLoading(false);
    }
  };

  /* Helper to create toolbar buttons — uses CSS classes for hover/active */
  const Btn = ({ onClick, active, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`te-btn ${active ? "te-btn-active" : ""}`}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="te-sep" />;

  return (
    <div className="te-toolbar">
      {/* Headings */}
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <span className="te-heading-label">H1</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <span className="te-heading-label" style={{ fontSize: 11 }}>H2</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <span className="te-heading-label" style={{ fontSize: 10 }}>H3</span>
      </Btn>

      <Sep />

      {/* Bold */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </Btn>
      {/* Italic */}
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </Btn>
      {/* Underline */}
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" y1="20" x2="20" y2="20" />
        </svg>
      </Btn>
      {/* Strikethrough */}
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </Btn>
      {/* Code Block */}
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      </Btn>
      {/* Highlight */}
      <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
        </svg>
      </Btn>
      {/* Link */}
      <Btn onClick={setLink} active={editor.isActive("link")} title="Add Link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </Btn>

      <Sep />

      {/* Alignment */}
      <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3" cy="6" r="1" fill="currentColor" /><circle cx="3" cy="12" r="1" fill="currentColor" /><circle cx="3" cy="18" r="1" fill="currentColor" /></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
      </Btn>

      <Sep />

      {/* Export & AI */}
      <Btn onClick={onOpenDownload} title="Download as PDF">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </Btn>

      <Sep />

      {/* AI Button */}
      <Btn onClick={onAiClick} title={isAiLoading ? "AI is thinking..." : "Ask AI (select text first)"}>
        {isAiLoading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#a855f7", animation: "spin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#a855f7" }}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4M3 5h4"/>
          </svg>
        )}
      </Btn>
    </div>
  );
}

/* ─── Editor Styles ─── */
const editorStyles = `
  /* ── Toolbar ── */
  .te-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .te-toolbar::-webkit-scrollbar { display: none; }

  .te-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #737373;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .te-btn:hover {
    background: rgba(255,255,255,0.07);
    color: #d4d4d4;
  }
  .te-btn-active,
  .te-btn-active:hover {
    background: rgba(249, 115, 22, 0.15) !important;
    color: #f97316 !important;
  }

  .te-sep {
    width: 1px;
    height: 18px;
    background: rgba(255,255,255,0.08);
    margin: 0 3px;
    flex-shrink: 0;
  }

  .te-heading-label {
    font-size: 12px;
    font-weight: 700;
    font-family: monospace;
  }

  /* ── Editor ── */
  .tiptap-editor .ProseMirror {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
    min-height: 400px;
    padding: 8px 0;
    color: #d4d4d4;
    font-size: 14px;
    line-height: 1.75;
    caret-color: #f97316;
  }

  .tiptap-editor .ProseMirror:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  .tiptap-editor .ProseMirror p { margin: 0.25em 0; }

  .tiptap-editor .ProseMirror h1 {
    font-size: 1.75em; font-weight: 700; color: #fafafa;
    margin: 0.75em 0 0.25em; line-height: 1.3;
  }
  .tiptap-editor .ProseMirror h2 {
    font-size: 1.35em; font-weight: 600; color: #fafafa;
    margin: 0.6em 0 0.2em; line-height: 1.35;
  }
  .tiptap-editor .ProseMirror h3 {
    font-size: 1.15em; font-weight: 600; color: #e5e5e5;
    margin: 0.5em 0 0.15em; line-height: 1.4;
  }

  .tiptap-editor .ProseMirror mark {
    background-color: rgba(249, 115, 22, 0.25);
    color: inherit; padding: 1px 3px; border-radius: 3px;
  }
  .tiptap-editor .ProseMirror strong { color: #fafafa; font-weight: 600; }
  .tiptap-editor .ProseMirror em { color: #d4d4d8; }
  .tiptap-editor .ProseMirror u {
    text-decoration-color: #f97316; text-underline-offset: 3px;
  }
  .tiptap-editor .ProseMirror s { color: #737373; }

  .tiptap-editor .ProseMirror ul,
  .tiptap-editor .ProseMirror ol { padding-left: 1.5em; margin: 0.35em 0; }
  .tiptap-editor .ProseMirror li { margin: 0.15em 0; }
  .tiptap-editor .ProseMirror ul > li { list-style-type: disc; }
  .tiptap-editor .ProseMirror ol > li { list-style-type: decimal; }

  .tiptap-editor .ProseMirror a {
    color: #f97316; text-decoration: underline;
    text-underline-offset: 2px; cursor: pointer;
    transition: color 0.15s;
  }
  .tiptap-editor .ProseMirror a:hover { color: #fb923c; }

  .tiptap-editor .ProseMirror pre {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 14px 16px; margin: 0.6em 0;
    overflow-x: auto;
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 13px; line-height: 1.6;
  }
  .tiptap-editor .ProseMirror pre code {
    color: #e5e5e5; background: none; padding: 0;
    border-radius: 0; font-size: inherit;
  }
  .tiptap-editor .ProseMirror code {
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.15);
    border-radius: 4px; padding: 1px 5px;
    font-family: 'Fira Code', monospace;
    font-size: 0.88em; color: #fb923c;
  }

  /* Syntax highlight */
  .tiptap-editor .ProseMirror .hljs-keyword { color: #c084fc; }
  .tiptap-editor .ProseMirror .hljs-string { color: #86efac; }
  .tiptap-editor .ProseMirror .hljs-number { color: #fbbf24; }
  .tiptap-editor .ProseMirror .hljs-comment { color: #6b7280; font-style: italic; }
  .tiptap-editor .ProseMirror .hljs-function,
  .tiptap-editor .ProseMirror .hljs-title { color: #60a5fa; }
  .tiptap-editor .ProseMirror .hljs-built_in { color: #f472b6; }
  .tiptap-editor .ProseMirror .hljs-params,
  .tiptap-editor .ProseMirror .hljs-attr { color: #fdba74; }
  .tiptap-editor .ProseMirror .hljs-selector-tag,
  .tiptap-editor .ProseMirror .hljs-tag { color: #f87171; }

  .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
    content: 'Start taking notes...';
    float: left; color: #525252; font-style: italic;
    pointer-events: none; height: 0;
  }

  .tiptap-editor .ProseMirror hr {
    border: none; border-top: 1px solid rgba(255,255,255,0.08);
    margin: 1.5em 0;
  }
  .tiptap-editor .ProseMirror blockquote {
    border-left: 3px solid #f97316;
    padding-left: 1em; margin: 0.6em 0;
    color: #a3a3a3; font-style: italic;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

/* ─── Text Editor Component ─── */
function TextEditor({ fileId, onHighlightPdf }) {
  const saveNote = useMutation(api.notes.saveNote);
  const noteData = useQuery(api.notes.getNote, fileId ? { fileId } : "skip");
  const saveTimerRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const [isDownloadOpen, setDownloadOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: "",
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
    onUpdate: ({ editor }) => {
      // Debounced auto-save: save 1.5s after the user stops typing
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (fileId) {
        saveTimerRef.current = setTimeout(() => {
          const html = editor.getHTML();
          saveNote({ fileId, content: html });
        }, 1500);
      }
    },
  });

  // Load saved content when noteData arrives
  useEffect(() => {
    if (editor && noteData && !hasLoadedRef.current) {
      editor.commands.setContent(noteData.content);
      hasLoadedRef.current = true;
    }
  }, [editor, noteData]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <style>{editorStyles}</style>
      <EditorToolbar editor={editor} onOpenDownload={() => setDownloadOpen(true)} onHighlightPdf={onHighlightPdf} />
      <div className="tiptap-editor flex-1 overflow-y-auto px-5 py-3" style={{ background: "transparent" }}>
        <EditorContent editor={editor} />
      </div>

      {/* Download PDF Dialog Overlay */}
      {(isDownloadOpen || isDownloadOpen === false) && (
        <DownloadDialog
          isOpen={isDownloadOpen}
          onClose={() => setDownloadOpen(false)}
          onSave={(filename) => downloadAsPDF(editor, filename)}
        />
      )}
    </div>
  );
}

export default TextEditor;
