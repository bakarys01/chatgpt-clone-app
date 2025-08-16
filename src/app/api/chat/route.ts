import { NextResponse } from 'next/server';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

/**
 * API route to proxy chat completions to OpenAI's REST API. This implementation
 * uses fetch directly to call the OpenAI endpoint and streams the response
 * back to the client. Using fetch avoids relying on the openai SDK and
 * eliminates potential type mismatches.
 */
export async function POST(req: Request) {
  try {
    const { messages, model, context } = await req.json();
    if (!messages) {
      return NextResponse.json(
        { error: 'Missing messages' },
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

    // Determine which model to use. Default to gpt-4o if none provided.
    const chosenModel = typeof model === 'string' && model.trim() ? model : 'gpt-4o';

    // Map hypothetical future models to available ones
    let actualModel = chosenModel;
    
    // Map future/hypothetical models to currently available ones
    if (chosenModel.startsWith('gpt-5')) {
      actualModel = 'gpt-4o'; // Use GPT-4o as the most advanced available
    } else if (chosenModel.startsWith('o3') || chosenModel.startsWith('o4')) {
      actualModel = 'gpt-4o'; // Use GPT-4o for reasoning models
    } else if (chosenModel.includes('4.1')) {
      actualModel = 'gpt-4o'; // Map GPT-4.1 variants to GPT-4o
    }
    
    console.log(`Mapping model ${chosenModel} to ${actualModel}`);

    // For GPT-4 and earlier models, build the chat messages array. If context
    // exists, prepend a system message instructing the model to use it.
    const chatMessages = Array.isArray(messages) ? [...messages] : [];
    if (context && typeof context === 'string' && context.trim().length > 0) {
      chatMessages.unshift({
        role: 'system',
        content: `The following context may be useful:\n${context.trim()}`,
      });
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: actualModel,
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}