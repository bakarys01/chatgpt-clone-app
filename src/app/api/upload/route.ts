import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

// This route handles file uploads for multiple formats including:
// - PDFs (text extraction)
// - Images (for vision models)
// - Text files (.txt, .md)
// - Documents (.doc, .docx - basic text extraction)
// It also computes embeddings via the OpenAI API for text content
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    console.log('📤 Upload API called');
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      console.log('❌ No file in request');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('📁 File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extracted = '';
    let fileCategory = 'unknown';
    let base64Data = '';

    // Handle different file types
    if (fileName.endsWith('.pdf')) {
      // PDF Processing
      console.log('📄 Processing PDF file');
      fileCategory = 'document';
      try {
        const data = await pdf(buffer);
        extracted = data.text.trim();
        console.log('✅ PDF processed, extracted', extracted.length, 'characters');
      } catch (err) {
        console.log('❌ PDF processing failed:', err);
        return NextResponse.json(
          { error: 'Failed to parse PDF. Ensure the file is a valid PDF.' },
          { status: 400 }
        );
      }
    } else if (fileType.startsWith('image/')) {
      // Image Processing
      fileCategory = 'image';
      base64Data = `data:${fileType};base64,${buffer.toString('base64')}`;
      extracted = `[Image: ${file.name}]`;
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileType === 'text/plain') {
      // Text File Processing
      console.log('📝 Processing text file');
      fileCategory = 'text';
      try {
        extracted = buffer.toString('utf-8').trim();
        console.log('✅ Text processed, extracted', extracted.length, 'characters');
      } catch (err) {
        console.log('❌ Text processing failed:', err);
        return NextResponse.json(
          { error: 'Failed to read text file. Ensure the file is valid UTF-8 text.' },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.json')) {
      // JSON File Processing
      fileCategory = 'structured';
      try {
        const jsonContent = JSON.parse(buffer.toString('utf-8'));
        extracted = JSON.stringify(jsonContent, null, 2);
      } catch (err) {
        return NextResponse.json(
          { error: 'Failed to parse JSON file. Ensure the file contains valid JSON.' },
          { status: 400 }
        );
      }
    } else {
      // Unsupported file type
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Supported types: PDF, images, text files, JSON.` },
        { status: 400 }
      );
    }

    // Compute embeddings for text content (not for images)
    const apiKey = process.env.OPENAI_API_KEY;
    let embedding: number[] | null = null;
    if (apiKey && extracted && fileCategory !== 'image') {
      try {
        const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small', // Updated to latest embedding model
            input: extracted.substring(0, 8000), // truncate to avoid exceeding limits
          }),
        });
        if (!embedRes.ok) {
          throw new Error(`Embedding request failed with status ${embedRes.status}`);
        }
        const embedJson = await embedRes.json();
        if (Array.isArray(embedJson.data) && embedJson.data.length > 0) {
          embedding = embedJson.data[0].embedding as number[];
        }
      } catch (err) {
        console.error('Embedding computation failed:', err);
      }
    }

    console.log('✅ Upload successful, returning data');
    return NextResponse.json({ 
      text: extracted, 
      embedding,
      fileCategory,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      base64Data: base64Data || undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}