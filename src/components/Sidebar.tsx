'use client';

import BeatsList, { Beat } from './BeatsList';

interface SidebarProps {
  isOpen: boolean;
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

export default function Sidebar({
  isOpen,
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
}: SidebarProps) {
  return (
    <aside
      className={`relative h-full border-r border-stone-800 bg-stone-950/70 p-4 transition-all duration-300 ${
        isOpen ? 'w-96' : 'w-0 p-0'
      }`}
    >
      <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} h-full transition-opacity`}>
        {isOpen && (
          <BeatsList
            beats={beats}
            activeBeatId={activeBeatId}
            onAddBeat={onAddBeat}
            onUpdateBeat={onUpdateBeat}
            onDeleteBeat={onDeleteBeat}
            onReorder={onReorder}
            onSelectBeat={onSelectBeat}
            onTagBeat={onTagBeat}
            onClearTag={onClearTag}
            isGenerating={isGenerating}
            onGenerateBeats={onGenerateBeats}
          />
        )}
      </div>
    </aside>
  );
}
