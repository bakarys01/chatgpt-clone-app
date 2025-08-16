import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * API route for image editing and variations using DALL-E
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;
    const operation = formData.get('operation') as string; // 'edit' or 'variation'
    const mask = formData.get('mask') as File | null;

    if (!image) {
      return NextResponse.json(
        { error: 'Missing image file' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not set' },
        { status: 500 }
      );
    }

    const uploadFormData = new FormData();
    uploadFormData.append('image', image);
    
    if (operation === 'edit') {
      if (!prompt) {
        return NextResponse.json(
          { error: 'Missing prompt for image edit' },
          { status: 400 }
        );
      }
      uploadFormData.append('prompt', prompt);
      if (mask) {
        uploadFormData.append('mask', mask);
      }
      uploadFormData.append('n', '1');
      uploadFormData.append('size', '1024x1024');

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { error: `Image edit failed: ${response.status} ${errText}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Create variation
      uploadFormData.append('n', '1');
      uploadFormData.append('size', '1024x1024');

      const response = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { error: `Image variation failed: ${response.status} ${errText}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}