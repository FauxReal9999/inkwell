import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, action, context } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    let systemPrompt: string;
    let userPrompt: string;

    switch (action) {
      case 'continue':
        systemPrompt = `You are a skilled fiction writer helping to continue a story. 
Write naturally in the same style, tone, and voice as the existing text.
Continue the story seamlessly - don't repeat what's already written.
Write 2-4 paragraphs that flow naturally from what came before.
Do not include any meta-commentary or notes - just write the story.`;
        userPrompt = `Continue this story:\n\n${prompt}`;
        break;

      case 'rewrite':
        systemPrompt = `You are a skilled editor helping to rewrite text.
Rewrite the given passage to improve it while maintaining the same meaning and voice.
Keep the same perspective, tense, and style as the original.
Do not add new plot elements - just improve the prose.
Return only the rewritten text, nothing else.`;
        userPrompt = context 
          ? `Context of the full story:\n${context}\n\nRewrite this passage:\n${prompt}`
          : `Rewrite this passage:\n${prompt}`;
        break;

      case 'expand':
        systemPrompt = `You are a skilled fiction writer helping to expand a scene.
Take the given passage and expand it with more detail, description, and depth.
Add sensory details, character thoughts, or scene-setting as appropriate.
Maintain the same voice, tense, and style.
Return only the expanded text, nothing else.`;
        userPrompt = context
          ? `Context of the full story:\n${context}\n\nExpand this passage with more detail:\n${prompt}`
          : `Expand this passage with more detail:\n${prompt}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const text = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate text' },
      { status: 500 }
    );
  }
}
