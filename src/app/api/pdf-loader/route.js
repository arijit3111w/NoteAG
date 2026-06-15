import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function GET(req) {
    const reqUrl = new URL(req.url);
    const pdfUrl = reqUrl.searchParams.get("pdfUrl");

    if (!pdfUrl) {
        return NextResponse.json({ error: "pdfUrl is required" }, { status: 400 });
    }

    try {
        // 1. Load the PDF File
        const response = await fetch(pdfUrl);
        const data = await response.blob();
        const loader = new PDFLoader(data);
        const docs = await loader.load();

        let pdfTextContent = '';
        docs.forEach(doc => {
            pdfTextContent = pdfTextContent + doc.pageContent;
        });

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

        return NextResponse.json({ result: splitterList });
    } catch (error) {
        console.error("Error loading PDF:", error);
        return NextResponse.json({ error: "Failed to load PDF content" }, { status: 500 });
    }
}
