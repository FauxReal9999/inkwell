'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { EditorHandle } from '@/components/Editor';
import Sidebar from '@/components/Sidebar';
import type { Beat } from '@/components/BeatsList';

const SIDEBAR_STORAGE_KEY = 'inkwell:sidebar:open';

function createBeatId() {
  return `beat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function Home() {
  const editorRef = useRef<EditorHandle | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(SIDEBAR_STORAGE_KEY) : null;
    if (stored !== null) {
      setSidebarOpen(stored === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
    }
  }, [sidebarOpen]);

  const handleAddBeat = (beat: Omit<Beat, 'id'>) => {
    setBeats((prev) => [{ id: createBeatId(), ...beat }, ...prev]);
  };

  const handleUpdateBeat = (id: string, updates: Partial<Omit<Beat, 'id'>>) => {
    setBeats((prev) => prev.map((beat) => (beat.id === id ? { ...beat, ...updates } : beat)));
  };

  const handleDeleteBeat = (id: string) => {
    setBeats((prev) => prev.filter((beat) => beat.id !== id));
    setActiveBeatId((prev) => (prev === id ? null : prev));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setBeats((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSelectBeat = (id: string) => {
    setActiveBeatId(id);
    const found = editorRef.current?.scrollToBeat(id);
    if (!found) {
      setGenerateError('No tagged section found for this beat yet.');
      setTimeout(() => setGenerateError(null), 2500);
    }
  };

  const handleTagBeat = (id: string) => {
    setActiveBeatId(id);
    editorRef.current?.tagSelection(id);
  };

  const handleClearTag = () => {
    editorRef.current?.clearBeatSelection();
  };

  const handleGenerateBeats = async () => {
    if (isGenerating) return;
    const text = editorRef.current?.getPlainText() || '';
    if (!text.trim()) {
      setGenerateError('Write some story text before generating beats.');
      setTimeout(() => setGenerateError(null), 2500);
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch('/api/beats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate beats');
      }

      const data = await response.json();
      if (Array.isArray(data.beats)) {
        setBeats(
          data.beats.map((beat: Omit<Beat, 'id'>) => ({
            id: createBeatId(),
            title: beat.title,
            description: beat.description,
            status: beat.status,
          }))
        );
      }
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate beats');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-900 text-stone-100">
      <header className="border-b border-stone-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-200 transition hover:bg-stone-800"
            >
              {sidebarOpen ? 'Hide beats' : 'Show beats'}
            </button>
            <h1 className="text-2xl font-bold text-amber-500">Inkwell</h1>
          </div>
          <span className="text-stone-500 text-sm">AI Writing Tool</span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-72px)]">
        <Sidebar
          isOpen={sidebarOpen}
          beats={beats}
          activeBeatId={activeBeatId}
          onAddBeat={handleAddBeat}
          onUpdateBeat={handleUpdateBeat}
          onDeleteBeat={handleDeleteBeat}
          onReorder={handleReorder}
          onSelectBeat={handleSelectBeat}
          onTagBeat={handleTagBeat}
          onClearTag={handleClearTag}
          isGenerating={isGenerating}
          onGenerateBeats={handleGenerateBeats}
        />
        <div className="flex-1 px-4 py-6">
          <div className="mx-auto w-full max-w-4xl">
            {generateError && (
              <div className="mb-4 rounded-lg border border-amber-700/60 bg-amber-900/20 px-4 py-2 text-sm text-amber-200">
                {generateError}
              </div>
            )}
            <Editor ref={editorRef} />
          </div>
        </div>
      </div>
    </main>
  );
}
