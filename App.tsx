import React, { useState, useCallback, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { AiDialog } from './components/AiDialog';
import { Sidebar } from './components/Sidebar';
import { EditorMode, ToastMessage, Player, HistoryEntry } from './types';
import { modifyHtmlWithAI } from './services/geminiService';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const INITIAL_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Awesome Page</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 { margin-top: 0; }
        p { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Hello World</h1>
        <p>Edit this HTML or ask AI to change it!</p>
    </div>
</body>
</html>`;

const DEFAULT_PLAYER_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <style>body { font-family: sans-serif; padding: 20px; }</style>
</head>
<body>
  <h1>New Player Profile</h1>
  <p>Import your file here.</p>
</body>
</html>`;

const App: React.FC = () => {
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [mode, setMode] = useState<EditorMode>(EditorMode.SPLIT);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Player Management State
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load players from localStorage on mount and migrate if necessary
  useEffect(() => {
    const savedPlayers = localStorage.getItem('htmlCloner_players');
    if (savedPlayers) {
      try {
        const parsedData = JSON.parse(savedPlayers);
        
        // Migration logic for old data format (single html string) to new (history array)
        const migratedPlayers: Player[] = parsedData.map((p: any) => {
          if (!p.history) {
            return {
              ...p,
              history: [{
                id: Math.random().toString(36).substr(2, 9),
                timestamp: p.updatedAt || Date.now(),
                html: p.html || DEFAULT_PLAYER_TEMPLATE
              }]
            };
          }
          return p;
        });

        setPlayers(migratedPlayers);
      } catch (e) {
        console.error("Failed to load players", e);
      }
    }
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('htmlCloner_players', JSON.stringify(players));
  }, [players]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Player Handlers
  const handleAddPlayer = (name: string) => {
    const newHistoryId = Math.random().toString(36).substr(2, 9);
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      history: [{
        id: newHistoryId,
        timestamp: Date.now(),
        html: DEFAULT_PLAYER_TEMPLATE
      }],
      updatedAt: Date.now()
    };
    setPlayers(prev => [...prev, newPlayer]);
    
    // Automatically select the new player
    setActivePlayerId(newPlayer.id);
    setActiveHistoryId(newHistoryId);
    setCode(DEFAULT_PLAYER_TEMPLATE);
    addToast('success', `Added ${name} to roster`);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    if (activePlayerId === id) {
      setActivePlayerId(null);
      setActiveHistoryId(null);
    }
    addToast('info', 'Player removed');
  };

  const handleSelectPlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player && player.history.length > 0) {
      // Select the most recent history entry (first one)
      const latestEntry = player.history[0];
      setActivePlayerId(id);
      setActiveHistoryId(latestEntry.id);
      setCode(latestEntry.html);
    }
  };

  const handleSelectHistory = (playerId: string, historyId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      const entry = player.history.find(h => h.id === historyId);
      if (entry) {
        setActivePlayerId(playerId);
        setActiveHistoryId(historyId);
        setCode(entry.html);
      }
    }
  };

  const handleDeleteHistory = (playerId: string, historyId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        return {
          ...p,
          history: p.history.filter(h => h.id !== historyId)
        };
      }
      return p;
    }));
  };

  const handleSaveToPlayer = () => {
    if (!activePlayerId) {
      const name = prompt("Enter a name to save this file under:");
      if (name) {
        // Create new player with current code as first history entry
        const newHistoryId = Math.random().toString(36).substr(2, 9);
        const newPlayer: Player = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          history: [{
            id: newHistoryId,
            timestamp: Date.now(),
            html: code
          }],
          updatedAt: Date.now()
        };
        setPlayers(prev => [...prev, newPlayer]);
        setActivePlayerId(newPlayer.id);
        setActiveHistoryId(newHistoryId);
        addToast('success', `Saved new player: ${name}`);
        return;
      }
      return;
    }

    // Add new snapshot to existing player history
    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      html: code
    };

    setPlayers(prev => prev.map(p => {
      if (p.id === activePlayerId) {
        return { 
          ...p, 
          history: [newEntry, ...p.history], // Add to top
          updatedAt: Date.now() 
        };
      }
      return p;
    }));

    setActiveHistoryId(newEntry.id); // Set active to the new version
    addToast('success', 'New version saved to history!');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Construct filename with player name and date if available
    let filename = 'index.html';
    if (activePlayerId) {
      const player = players.find(p => p.id === activePlayerId);
      if (player) {
        const dateStr = new Date().toISOString().split('T')[0];
        filename = `${player.name}_${dateStr}.html`;
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'File downloaded successfully!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      addToast('success', 'HTML copied to clipboard!');
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        addToast('info', 'Clipboard is empty.');
        return;
      }
      if (code.trim().length > 20 && !window.confirm('Replace current code?')) {
        return;
      }
      setCode(text);
      addToast('success', 'Code pasted!');
    } catch (err) {
      addToast('error', 'Failed to paste.');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        addToast('success', 'File loaded! Click Save to add to history.');
      };
      reader.onerror = () => {
        addToast('error', 'Failed to read file.');
      };
      reader.readAsText(file);
    }
  };

  const handleAiSubmit = async (instruction: string) => {
    setIsAiDialogOpen(false);
    setIsAiLoading(true);
    try {
      const newCode = await modifyHtmlWithAI(code, instruction);
      setCode(newCode);
      addToast('success', 'AI modified the HTML!');
    } catch (error) {
      addToast('error', 'Failed to generate HTML.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const activePlayerName = players.find(p => p.id === activePlayerId)?.name;

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <Toolbar
        onDownload={handleDownload}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onUpload={handleUpload}
        onSave={handleSaveToPlayer}
        mode={mode}
        setMode={setMode}
        onAiRequest={() => setIsAiDialogOpen(true)}
        isAiLoading={isAiLoading}
        activePlayerName={activePlayerName}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          players={players}
          activePlayerId={activePlayerId}
          activeHistoryId={activeHistoryId}
          onSelectPlayer={handleSelectPlayer}
          onSelectHistory={handleSelectHistory}
          onAddPlayer={handleAddPlayer}
          onDeletePlayer={handleDeletePlayer}
          onDeleteHistory={handleDeleteHistory}
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex overflow-hidden">
            <Editor
              code={code}
              onChange={setCode}
              visible={mode === EditorMode.EDIT || mode === EditorMode.SPLIT}
            />
            
            {mode === EditorMode.SPLIT && (
              <div className="w-px bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors z-20" />
            )}

            <Preview
              code={code}
              visible={mode === EditorMode.PREVIEW || mode === EditorMode.SPLIT}
            />
          </div>
        </div>
      </div>

      <AiDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        onSubmit={handleAiSubmit}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md animate-slide-up ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-200' 
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-200'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <CheckCircle2 size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;