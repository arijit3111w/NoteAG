import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

import { v } from "convex/values";

export const ingest = action({
  args: {
    splitText: v.array(v.string()),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    // Create an array of metadata objects, one for each text chunk
    const metadata = args.splitText.map(() => ({
      fileId: args.fileId,
    }));

    await ConvexVectorStore.fromTexts(
      args.splitText,
      metadata,
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-embedding-2", // 3072 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document chunk",
      }),
      { ctx }
    );
  },
});

export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    // ── Detect if this is a summary request ──
    const isSummaryRequest = /\b(summar(y|ize|ise)|overview|key points?|main ideas?|gist|recap|brief)\b/i.test(args.query);
    const chunkLimit = isSummaryRequest ? 20 : 5; // Get more chunks for summaries

    console.log(`Query type: ${isSummaryRequest ? 'SUMMARY' : 'SPECIFIC'}, fetching ${chunkLimit} chunks`);

    // ── Step 1: Retrieve relevant chunks via vector search ──
    const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        model: "gemini-embedding-2",
        taskType: TaskType.RETRIEVAL_QUERY,
      }),
      { ctx }
    );

    const results = await vectorStore.similaritySearch(args.query, chunkLimit);
    const relevantChunks = results.filter(q => q.metadata.fileId === args.fileId);
    console.log("Retrieved chunks:", relevantChunks.length);

    // Combine the retrieved chunks into a single context string
    const context = relevantChunks.map(c => c.pageContent).join("\n\n");

    // ── Step 2: Generate a concise answer using the NEW Gemini SDK ──
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    
    // Try models in order of preference (based on quota availability)
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-1.5-flash",      // Stable, higher quota
      "gemini-1.5-pro",        // Backup option
    ];
    
    let modelStr = modelsToTry[0];
    console.log(`Using model: ${modelStr}`);

    // Different prompt for summary vs specific questions
    const basePrompt = isSummaryRequest 
      ? `You are NoteAG AI — an intelligent document assistant. The user has requested a SUMMARY of their PDF document.

You will be given DOCUMENT CONTEXT (extracted from the PDF) and a USER QUESTION requesting a summary.

You MUST respond strictly with a valid JSON object in the following format:
{
  "answer": "Your comprehensive markdown summary here...",
  "exact_highlight_phrase": ""
}

**Summary Requirements:**
- Provide a well-structured summary covering the main topics in the document
- Use **bold** for key concepts and terms
- Use bullet points (•) or numbered lists for clarity
- Cover major sections, findings, or themes
- Length should match the user's request (e.g., "in 10 lines" means ~10 bullet points)
- Be comprehensive but concise
- DO NOT say "this information is not in the PDF" — you have enough context
- When outputting math, use standard LaTeX enclosed in $...$ for inline or $$...$$ for block.

**For the "exact_highlight_phrase" field:**
- Always return an empty string "" for summary requests (no specific highlighting needed)

--- DOCUMENT CONTEXT ---
${context}
--- END CONTEXT ---

User's Question: ${args.query}`
      : `You are NoteAG AI — an intelligent document assistant embedded in a professional note-taking application. Your role is to help users extract insights from their uploaded PDF documents.

You will be given DOCUMENT CONTEXT (extracted from the user's PDF) and a USER QUESTION.

You MUST respond strictly with a valid JSON object in the following format:
{
  "answer": "Your detailed markdown answer here...",
  "exact_highlight_phrase": "A specific 4-to-8 word exact phrase from the DOCUMENT CONTEXT that best proves your answer."
}

Follow these rules for the "answer" field strictly:
**TIER 1 — Direct Answer (from document):**
If the answer is clearly found in the provided document context, answer concisely and accurately using ONLY the document content.
**TIER 2 — Related but not in document (from general knowledge):**
If the question is RELATED to the document's topic/domain but the specific answer is NOT found in the context, provide a helpful answer and append the tag **(from the web)** at the very end.
**TIER 3 — Completely off-topic:**
If the question is entirely unrelated to the document, respond ONLY with: "❌ This information is not present in the provided PDF and is unrelated to its content."

Follow these rules for the "exact_highlight_phrase" field strictly:
- It MUST be an EXACT, continuous substring directly copied from the DOCUMENT CONTEXT.
- It MUST be the specific phrase that DIRECTLY answers the question (e.g., if asked where an internship was, the phrase should be "internship at Infosys Springboard", NOT the document title or email).
- Keep it between 4 and 8 words long.
- If it's a Tier 2 or Tier 3 response, return an empty string "".

**Formatting Rules for answer:**
- Use **bold** for emphasis on key terms.
- Use bullet points for lists.
- When providing code, wrap it in a fenced code block with the language specified (e.g., \`\`\`python ... \`\`\`).
- Keep answers concise — ideally 2-5 sentences for Tier 1 and Tier 3, and up to a short paragraph for Tier 2.
- Never fabricate document content. If you're unsure, default to Tier 2 or Tier 3.
- When outputting math, use standard LaTeX enclosed in $...$ for inline or $$...$$ for block.

--- DOCUMENT CONTEXT ---
${context}
--- END CONTEXT ---

User's Question: ${args.query}`;

    try {
      let result;
      let lastError;
      
      // Try each model until one works
      for (const model of modelsToTry) {
        try {
          console.log(`Attempting to use model: ${model}`);
          result = await ai.models.generateContent({
            model: model,
            contents: basePrompt
          });
          modelStr = model;
          console.log(`✅ Success with model: ${model}`);
          break; // Success! Exit the loop
        } catch (err) {
          console.log(`❌ Model ${model} failed:`, err.message || JSON.stringify(err));
          lastError = err;
          
          // Check if it's a quota/rate limit error (multiple ways to check)
          const errStr = JSON.stringify(err);
          const isQuotaError = 
            err.message?.includes("quota") || 
            err.message?.includes("429") ||
            err.message?.includes("RESOURCE_EXHAUSTED") ||
            errStr.includes("quota") ||
            errStr.includes("429") ||
            errStr.includes("RESOURCE_EXHAUSTED");
          
          if (isQuotaError) {
            console.log(`⏭️ Quota error detected, trying next model...`);
            continue; // Try next model
          }
          
          // For other errors, throw immediately
          throw err;
        }
      }
      
      // If all models failed, throw the last error
      if (!result) {
        throw lastError || new Error("All models failed");
      }
      
      const rawText = typeof result.text === 'function' ? result.text() : result.text;
      
      // Parse the JSON response from the AI (strip potential markdown code blocks)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : rawText;
      const parsedAi = JSON.parse(jsonStr);
      
      let answer = parsedAi.answer;
      const highlightQuery = parsedAi.exact_highlight_phrase || "";

      console.log("AI Answer:", answer);
      console.log("Highlight Query:", highlightQuery);

      return JSON.stringify({
        answer: answer,
        sources: relevantChunks.map(c => c.pageContent.substring(0, 100) + "..."),
        highlightQuery: highlightQuery
      });
    } catch (err) {
      console.error("Gemini generation failed:", err.message || JSON.stringify(err));
      
      return JSON.stringify({
        answer: "Too much traffic try after sometimes",
        sources: [],
        highlightQuery: ""
      });
    }
  },
});
