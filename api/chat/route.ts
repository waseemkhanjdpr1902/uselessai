// api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';   // ← change to your provider

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai('gpt-4o-mini'),     // or whatever model you use
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: 'AI request failed' }), { 
      status: 500 
    });
  }
}
