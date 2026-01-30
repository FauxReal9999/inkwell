'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useCallback } from 'react';

interface EditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export default function Editor({ initialContent = '', onContentChange }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] px-4 py-2',
      },
    },
  });

  const continueWriting = useCallback(async () => {
    if (!editor || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    const currentContent = editor.getText();
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentContent,
          action: 'continue'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Generation failed');
      }
      
      const data = await response.json();
      
      // Insert generated text at cursor or end
      editor.chain().focus().insertContent(data.text).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [editor, isGenerating]);

  const rewriteSelection = useCallback(async () => {
    if (!editor || isGenerating) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (!selectedText) {
      setError('Select some text to rewrite');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: selectedText,
          action: 'rewrite',
          context: editor.getText()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Rewrite failed');
      }
      
      const data = await response.json();
      
      // Replace selection with rewritten text
      editor.chain().focus().deleteSelection().insertContent(data.text).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [editor, isGenerating]);

  const expandSelection = useCallback(async () => {
    if (!editor || isGenerating) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    if (!selectedText) {
      setError('Select some text to expand');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: selectedText,
          action: 'expand',
          context: editor.getText()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Expand failed');
      }
      
      const data = await response.json();
      
      // Replace selection with expanded text
      editor.chain().focus().deleteSelection().insertContent(data.text).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [editor, isGenerating]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-stone-900 border-b border-stone-700 p-3 flex gap-2 flex-wrap">
        <button
          onClick={continueWriting}
          disabled={isGenerating}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 text-white rounded-lg font-medium transition-colors"
        >
          {isGenerating ? 'Writing...' : '✨ Continue'}
        </button>
        <button
          onClick={rewriteSelection}
          disabled={isGenerating}
          className="px-4 py-2 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 text-white rounded-lg font-medium transition-colors"
        >
          🔄 Rewrite
        </button>
        <button
          onClick={expandSelection}
          disabled={isGenerating}
          className="px-4 py-2 bg-stone-700 hover:bg-stone-600 disabled:bg-stone-800 text-white rounded-lg font-medium transition-colors"
        >
          📖 Expand
        </button>
        
        <div className="flex-1" />
        
        <span className="text-stone-400 text-sm self-center">
          {editor?.storage.characterCount?.words?.() || 0} words
        </span>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      
      {/* Editor */}
      <div className="bg-stone-800 min-h-[70vh] border border-stone-700 rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
