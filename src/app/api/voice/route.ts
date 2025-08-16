import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * API route for voice features:
 * - Speech-to-text (Whisper)
 * - Text-to-speech (TTS)
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const operation = formData.get('operation') as string;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not set' },
        { status: 500 }
      );
    }

    if (operation === 'transcribe') {
      // Speech-to-text using Whisper
      const audioFile = formData.get('audio') as File;
      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        );
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', audioFile);
      uploadFormData.append('model', 'whisper-1');
      uploadFormData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { error: `Transcription failed: ${response.status} ${errText}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      return NextResponse.json({ text: data.text });

    } else if (operation === 'speak') {
      // Text-to-speech
      const text = formData.get('text') as string;
      const voice = formData.get('voice') as string || 'alloy';
      const model = formData.get('model') as string || 'tts-1';

      if (!text) {
        return NextResponse.json(
          { error: 'No text provided' },
          { status: 400 }
        );
      }

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          input: text,
          voice: voice,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json(
          { error: `Speech synthesis failed: ${response.status} ${errText}` },
          { status: 500 }
        );
      }

      // Return the audio as a blob
      const audioBuffer = await response.arrayBuffer();
      return new Response(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="speech.mp3"',
        },
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid operation. Use "transcribe" or "speak"' },
        { status: 400 }
      );
    }

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}