import Editor from '@/components/Editor';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-900 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-500">Inkwell</h1>
          <span className="text-stone-500 text-sm">AI Writing Tool</span>
        </div>
      </header>
      
      {/* Editor Area */}
      <div className="py-6 px-4">
        <Editor />
      </div>
    </main>
  );
}
