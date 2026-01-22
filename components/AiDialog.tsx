import React, { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';

interface AiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instruction: string) => void;
}

export const AiDialog: React.FC<AiDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [instruction, setInstruction] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instruction.trim()) {
      onSubmit(instruction);
      setInstruction('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden transform transition-all">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Sparkles className="text-purple-400" size={18} />
            AI Assistant
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-400 text-sm mb-4">
            Describe how you want to modify the HTML. You can ask for styling changes, new sections, or complete redesigns.
          </p>
          
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full h-32 bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600 resize-none"
            placeholder="e.g. Change the background to a dark gradient and make the font larger..."
            autoFocus
          />
          
          <div className="flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!instruction.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
              <Wand2 size={16} />
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};