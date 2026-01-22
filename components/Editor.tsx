import React from 'react';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  visible: boolean;
}

export const Editor: React.FC<EditorProps> = ({ code, onChange, visible }) => {
  if (!visible) return null;

  return (
    <div className="flex-1 h-full relative group bg-gray-950 flex flex-col min-w-0">
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-800 text-xs text-gray-400 flex items-center px-4 border-b border-gray-700 z-10">
        HTML Source
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full pt-10 p-4 bg-gray-950 text-gray-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
        spellCheck={false}
        placeholder="<!-- Paste your HTML here... -->"
      />
    </div>
  );
};