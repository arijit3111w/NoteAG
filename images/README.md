# Images Directory

This directory contains visual assets for the README.md and IMPLEMENTATION_GUIDE.md.

## Required Images

Please save the following screenshots with these exact filenames:

### 1. `noteag_workspace_full.png`
**Description:** Full-width screenshot of the NoteAG workspace showing:
- Complete application interface in dark mode
- PDF viewer on the left side displaying a document with highlighted text
- Text editor on the right side with AI-generated answers and rich text formatting
- Header with NoteAG logo, navigation (HOME, FEATURES, PRICING), and user profile
- The split-screen interface demonstrating the complete Q&A workflow

**Current Screenshot:** Browser showing complete NoteAG interface with "Virtualization.pdf" and "Types of Hypervisors" content with AI-generated answer

**Usage:** Main hero image for README.md

---

### 2. `noteag_workspace.png`
**Description:** Screenshot of the NoteAG workspace (can be same as above or cropped version)
- PDF viewer on the left side displaying a document
- Text editor on the right side with AI-generated answers
- The split-screen interface demonstrating the Q&A workflow

**Current Screenshot:** Browser DevTools showing the NoteAG interface with "Workspace" sidebar and "Top Regulation.pdf" file

**Usage:** Used in IMPLEMENTATION_GUIDE.md to show the interface

---

### 3. `langchain_pipeline.png`
**Description:** LangChain data pipeline diagram showing the flow:
- **Source** → **Load** → **Transform** → **Embed** → **Store** → **Retrieve**
- Visual representation of how PDF data flows through the embedding pipeline
- Shows splitting into small chunks at the Transform stage

**Current Diagram:** Data connection pipeline with Source (PDF files) → Load (text extraction) → Transform (split into chunks) → Embed (vector generation) → Store (database) → Retrieve (similarity search)

**Usage:** Shows the standard LangChain data pipeline in both README.md and IMPLEMENTATION_GUIDE.md

---

### 4. `convex_dashboard.png`
**Description:** Convex dashboard screenshot displaying:
- The `documents` table with columns: `_id`, `embedding`, `metadata`, `text`
- Example rows showing vector embeddings as arrays of numbers (e.g., `[0.00852593943, 0.017...]`)
- Demonstrates how chunks and their embeddings are stored in the database

**Current Screenshot:** Convex database interface showing 12 documents with embedding arrays, metadata with fileId, and text content snippets

**Usage:** Shows what's actually stored in the database in both README.md and IMPLEMENTATION_GUIDE.md

---

### 5. `two_pipelines_diagram.png`
**Description:** Complete system architecture diagram showing both main flows:

**Left Side - UPLOAD & EMBED FLOW (Q1-Q5):**
1. User Uploads PDF
2. generateUploadUrl()
3. PDF Binary Uploaded → Convex Storage
4. addPdfFile()
5. /api/pdf-loader?pdfUrl=...
6. PDFLoader + TextSplitter → Chunks
7. ingest() Action → Embedding
8. GoogleGenerativeAIEmbeddings → 3072-dim vectors
9. ConvexVectorStore Stores → documents table

**Right Side - QUERY & ANSWER FLOW (Q6-Q7):**
1. User Query
2. search() Action → query embedding
3. GoogleGenerativeAIEmbeddings (RETRIEVAL_QUERY mode)
4. similaritySearch() → Top 5 Matching Chunks
5. fileId Filter
6. Combine Chunks into 'context'
7. Send to Gemini 2.0
8. AI generates structured JSON: `{"answer": ..., "highlightQuery": ...}`
9. Final Formatted Answer → Answer shown in editor, PDF scrolls to section, Orange highlight appears, LaTeX→Unicode conversion

**Current Diagram:** Side-by-side comparison of Upload & Embed Flow vs Query & Answer Flow with icons and detailed step-by-step breakdown

**Usage:** Main architecture diagram used in both README.md and IMPLEMENTATION_GUIDE.md

---

## How to Add Images

1. Save each screenshot/diagram from your browser with the exact filename above
2. Place them in this `images` directory
3. The README.md and IMPLEMENTATION_GUIDE.md already reference these paths:
   - `./images/noteag_workspace_full.png` (README hero image)
   - `./images/noteag_workspace.png` (Implementation guide)
   - `./images/langchain_pipeline.png`
   - `./images/convex_dashboard.png`
   - `./images/two_pipelines_diagram.png`

## Current Status

- [ ] noteag_workspace_full.png (needed for README)
- [ ] noteag_workspace.png (needed for IMPLEMENTATION_GUIDE)
- [ ] langchain_pipeline.png
- [ ] convex_dashboard.png
- [ ] two_pipelines_diagram.png

---

**Note:** Once you save these images with the correct filenames, the markdown files will automatically display them when rendered on GitHub.
