'use client';

import { useMemo, useState } from 'react';

export type BeatStatus = 'planned' | 'writing' | 'done';

export interface Beat {
  id: string;
  title: string;
  description: string;
  status: BeatStatus;
}

interface BeatsListProps {
  beats: Beat[];
  activeBeatId: string | null;
  onAddBeat: (beat: Omit<Beat, 'id'>) => void;
  onUpdateBeat: (id: string, updates: Partial<Omit<Beat, 'id'>>) => void;
  onDeleteBeat: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onSelectBeat: (id: string) => void;
  onTagBeat: (id: string) => void;
  onClearTag: () => void;
  isGenerating: boolean;
  onGenerateBeats: () => void;
}

const statusOptions: BeatStatus[] = ['planned', 'writing', 'done'];

function statusLabel(status: BeatStatus) {
  switch (status) {
    case 'planned':
      return 'Planned';
    case 'writing':
      return 'Writing';
    case 'done':
      return 'Done';
    default:
      return status;
  }
}

function statusClasses(status: BeatStatus) {
  switch (status) {
    case 'planned':
      return 'bg-stone-700 text-stone-200';
    case 'writing':
      return 'bg-amber-600/20 text-amber-300 border border-amber-600/40';
    case 'done':
      return 'bg-emerald-700/20 text-emerald-300 border border-emerald-600/30';
    default:
      return 'bg-stone-700 text-stone-200';
  }
}

export default function BeatsList({
  beats,
  activeBeatId,
  onAddBeat,
  onUpdateBeat,
  onDeleteBeat,
  onReorder,
  onSelectBeat,
  onTagBeat,
  onClearTag,
  isGenerating,
  onGenerateBeats,
}: BeatsListProps) {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftStatus, setDraftStatus] = useState<BeatStatus>('planned');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const isFormValid = draftTitle.trim().length > 0;

  const usedTitles = useMemo(
    () => new Set(beats.map((beat) => beat.title.toLowerCase().trim())),
    [beats]
  );

  const canAddDuplicate = draftTitle.trim().length === 0 || !usedTitles.has(draftTitle.toLowerCase().trim());

  const handleAdd = () => {
    if (!isFormValid) return;
    onAddBeat({
      title: draftTitle.trim(),
      description: draftDescription.trim(),
      status: draftStatus,
    });
    setDraftTitle('');
    setDraftDescription('');
    setDraftStatus('planned');
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
        <h2 className="text-lg font-semibold text-stone-100">Story beats</h2>
        <p className="mt-1 text-xs text-stone-400">
          Plan your structure, tag the editor, and keep momentum.
        </p>
        <button
          type="button"
          onClick={onGenerateBeats}
          disabled={isGenerating}
          className="mt-3 w-full rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? 'Generating beats…' : '✨ Generate beats from draft'}
        </button>
      </div>

      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-200">New beat</h3>
          <button
            type="button"
            onClick={onClearTag}
            className="text-xs text-stone-400 transition hover:text-amber-200"
          >
            Clear tag
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Beat title"
            className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600"
          />
          <textarea
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            placeholder="What happens?"
            rows={3}
            className="resize-none rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600"
          />
          <div className="flex items-center gap-2">
            <select
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value as BeatStatus)}
              className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!isFormValid || !canAddDuplicate}
              className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-stone-700"
            >
              Add
            </button>
          </div>
          {!canAddDuplicate && (
            <p className="text-xs text-amber-300">A beat with this title already exists.</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60">
        <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-stone-200">Beat list</h3>
          <span className="text-xs text-stone-500">{beats.length} total</span>
        </div>
        <div className="max-h-[45vh] overflow-y-auto px-3 py-2">
          {beats.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-700 p-4 text-center text-xs text-stone-500">
              Add your first beat to start building structure.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {beats.map((beat, index) => (
                <div
                  key={beat.id}
                  className={`rounded-lg border px-3 py-3 transition ${
                    activeBeatId === beat.id
                      ? 'border-amber-500/60 bg-amber-500/10'
                      : 'border-stone-800 bg-stone-950/80'
                  }`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null || dragIndex === index) return;
                    onReorder(dragIndex, index);
                    setDragIndex(null);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectBeat(beat.id)}
                      className="text-left text-sm font-semibold text-stone-100 hover:text-amber-200"
                    >
                      {beat.title || 'Untitled beat'}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${statusClasses(beat.status)}`}>
                        {statusLabel(beat.status)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteBeat(beat.id)}
                        className="text-xs text-stone-400 transition hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={beat.description}
                    onChange={(event) => onUpdateBeat(beat.id, { description: event.target.value })}
                    placeholder="Describe the beat"
                    rows={2}
                    className="mt-2 w-full resize-none rounded-md border border-stone-800 bg-stone-900 px-2 py-1 text-xs text-stone-200 placeholder:text-stone-600"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={beat.status}
                      onChange={(event) =>
                        onUpdateBeat(beat.id, { status: event.target.value as BeatStatus })
                      }
                      className="rounded-md border border-stone-800 bg-stone-900 px-2 py-1 text-xs text-stone-200"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onTagBeat(beat.id)}
                      className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-200 transition hover:bg-amber-500/20"
                    >
                      Tag selection
                    </button>
                    {activeBeatId === beat.id && (
                      <span className="text-xs text-amber-300">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
