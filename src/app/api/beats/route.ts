import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

interface BeatPayload {
  title: string;
  description: string;
  status: 'planned' | 'writing' | 'done';
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const systemPrompt = `You are a story structure assistant.\n\nAnalyze the story text and create a concise list of story beats.\nReturn 5-8 beats with short titles and 1-2 sentence descriptions.\nStatuses should reflect progress in the text:\n- done: already happened in the text\n- writing: currently unfolding\n- planned: implied or likely next\nReturn only JSON that matches this schema:\n{ "beats": [ { "title": string, "description": string, "status": "planned" | "writing" | "done" } ] }`;

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No beats generated' }, { status: 500 });
    }

    let parsed: { beats?: BeatPayload[] };
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error('Beat JSON parse error:', error);
      return NextResponse.json({ error: 'Invalid beats response' }, { status: 500 });
    }

    if (!parsed.beats || !Array.isArray(parsed.beats)) {
      return NextResponse.json({ error: 'Invalid beats response' }, { status: 500 });
    }

    const cleaned = parsed.beats
      .filter((beat) => beat.title && beat.description)
      .map((beat) => ({
        title: String(beat.title).trim(),
        description: String(beat.description).trim(),
        status: beat.status === 'done' || beat.status === 'writing' ? beat.status : 'planned',
      }))
      .filter((beat) => beat.title.length > 0);

    return NextResponse.json({ beats: cleaned });
  } catch (error) {
    console.error('Beat generation error:', error);
    return NextResponse.json({ error: 'Failed to generate beats' }, { status: 500 });
  }
}
