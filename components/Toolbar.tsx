import React from 'react';
import { Download, Copy, Play, SplitSquareHorizontal, Monitor, Code2, Wand2, Upload, ClipboardPaste, Save } from 'lucide-react';
import { EditorMode } from '../types';

interface ToolbarProps {
  onDownload: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  onAiRequest: () => void;
  isAiLoading: boolean;
  activePlayerName?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onDownload, 
  onCopy, 
  onPaste,
  onUpload,
  onSave,
  mode, 
  setMode,
  onAiRequest,
  isAiLoading,
  activePlayerName
}) => {
  return (
    <div className="h-16 border-b border-gray-700 bg-gray-900 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
          <Code2 className="text-blue-400" />
          HTML Cloner
        </h1>
        
        {activePlayerName && (
          <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
            <span className="text-xs text-gray-400 mr-2">Editing:</span>
            <span className="text-sm font-semibold text-white">{activePlayerName}</span>
          </div>
        )}

        <div className="h-6 w-px bg-gray-700 mx-2" />
        
        <div className="flex bg-gray-800 rounded-lg p-1 hidden md:flex">
          <button
            onClick={() => setMode(EditorMode.EDIT)}
            className={`p-2 rounded-md transition-colors ${mode === EditorMode.EDIT ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Code Only"
          >
            <Code2 size={18} />
          </button>
          <button
            onClick={() => setMode(EditorMode.SPLIT)}
            className={`p-2 rounded-md transition-colors ${mode === EditorMode.SPLIT ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Split View"
          >
            <SplitSquareHorizontal size={18} />
          </button>
          <button
            onClick={() => setMode(EditorMode.PREVIEW)}
            className={`p-2 rounded-md transition-colors ${mode === EditorMode.PREVIEW ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Preview Only"
          >
            <Monitor size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
         <button
          onClick={onAiRequest}
          disabled={isAiLoading}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
            isAiLoading 
              ? 'bg-purple-900/50 text-purple-300 cursor-wait' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
          }`}
        >
          <Wand2 size={16} className={isAiLoading ? 'animate-spin' : ''} />
          <span className="hidden md:inline">{isAiLoading ? 'Generating...' : 'AI Edit'}</span>
          <span className="md:hidden">AI</span>
        </button>

        <div className="h-6 w-px bg-gray-700 mx-1 hidden md:block" />

        <button
          onClick={onSave}
          className={`p-2 rounded-lg transition-colors border ${activePlayerName ? 'bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
          title={activePlayerName ? `Save to ${activePlayerName}` : "Save"}
        >
          <Save size={20} />
        </button>

        <label className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Upload HTML File">
          <input type="file" accept=".html,.htm" onChange={onUpload} className="hidden" />
          <Upload size={20} />
        </label>

        <button
          onClick={onPaste}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors hidden md:block"
          title="Paste from Clipboard"
        >
          <ClipboardPaste size={20} />
        </button>
        
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 text-sm md:text-base"
        >
          <Download size={18} />
          <span className="hidden md:inline">Download</span>
        </button>
      </div>
    </div>
  );
};