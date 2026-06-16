import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function GET(req) {
    const reqUrl = new URL(req.url);
    const pdfUrl = reqUrl.searchParams.get("pdfUrl");

    if (!pdfUrl) {
        return NextResponse.json({ error: "pdfUrl is required" }, { status: 400 });
    }

    try {
        // 1. Load the PDF File
        console.log("1. Fetching PDF from URL:", pdfUrl);
        const response = await fetch(pdfUrl);
        const data = await response.blob();
        console.log("2. PDF fetched, blob size:", data.size);
        
        const loader = new WebPDFLoader(data);
        const docs = await loader.load();
        console.log("3. PDF loaded, number of docs:", docs.length);

        let pdfTextContent = '';
        docs.forEach(doc => {
            pdfTextContent = pdfTextContent + doc.pageContent;
        });
        console.log("4. Extracted text content length:", pdfTextContent.length);

        // 2. Split the Text into Small Chunks
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const output = await splitter.createDocuments([pdfTextContent]);

        let splitterList = [];
        output.forEach(doc => {
            splitterList.push(doc.pageContent);
        });
        console.log("5. Text split into chunks, number of chunks:", splitterList.length);

        return NextResponse.json({ result: splitterList });
    } catch (error) {
        console.error("Error loading PDF:", error);
        return NextResponse.json({ error: "Failed to load PDF content" }, { status: 500 });
    }
}
