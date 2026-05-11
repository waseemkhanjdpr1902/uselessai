import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(
      JSON.stringify({ error: 'AI request failed. Please try again.' }), 
      { status: 500 }
    );
  }
}
