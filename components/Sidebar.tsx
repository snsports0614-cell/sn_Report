import React, { useState } from 'react';
import { Users, Plus, Trash2, User, Search, History, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { Player } from '../types';

interface SidebarProps {
  players: Player[];
  activePlayerId: string | null;
  activeHistoryId: string | null;
  onSelectPlayer: (id: string) => void;
  onSelectHistory: (playerId: string, historyId: string) => void;
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (id: string) => void;
  onDeleteHistory: (playerId: string, historyId: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  players,
  activePlayerId,
  activeHistoryId,
  onSelectPlayer,
  onSelectHistory,
  onAddPlayer,
  onDeletePlayer,
  onDeleteHistory,
  isOpen,
  toggleSidebar,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(timestamp));
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleSidebar}
        className="w-12 h-full bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 gap-4 hover:bg-gray-800 transition-colors"
        title="Open Roster"
      >
        <Users className="text-gray-400" />
      </button>
    );
  }

  return (
    <div className="w-64 h-full bg-gray-900 border-r border-gray-700 flex flex-col shrink-0 transition-all duration-300">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-bold text-gray-200 flex items-center gap-2">
          <Users size={18} className="text-blue-400" />
          Roster
        </h2>
        <button onClick={toggleSidebar} className="text-gray-500 hover:text-white">
          <span className="text-xs uppercase font-mono">Hide</span>
        </button>
      </div>

      <div className="p-4 border-b border-gray-800">
        <form onSubmit={handleAddSubmit} className="flex gap-2 mb-3">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="New Player Name"
            className="flex-1 bg-gray-950 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-md disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </form>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roster..."
            className="w-full bg-gray-800 border-none rounded-md py-1.5 pl-8 pr-3 text-xs text-gray-300 focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredPlayers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm ? 'No players found' : 'No players added yet'}
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredPlayers.map((player) => {
              const isActive = activePlayerId === player.id;
              
              return (
                <div key={player.id} className="border-b border-gray-800/50">
                  <div
                    onClick={() => onSelectPlayer(player.id)}
                    className={`group flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-blue-900/20 border-l-2 border-l-blue-500' 
                        : 'hover:bg-gray-800 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-1.5 rounded-full ${isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-400'}`}>
                        <User size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-medium truncate ${isActive ? 'text-blue-100' : 'text-gray-300'}`}>
                          {player.name}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          {player.history.length} versions
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm(`Delete ${player.name} and all history?`)) onDeletePlayer(player.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* History Timeline */}
                  {isActive && (
                    <div className="bg-gray-900/50 pb-2">
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <History size={10} />
                        Version History
                      </div>
                      <div className="flex flex-col">
                        {player.history.map((entry, index) => {
                          const isHistoryActive = activeHistoryId === entry.id;
                          return (
                            <div
                              key={entry.id}
                              onClick={() => onSelectHistory(player.id, entry.id)}
                              className={`group/item flex items-center gap-3 pl-8 pr-3 py-2 cursor-pointer transition-colors ${
                                isHistoryActive
                                  ? 'bg-blue-500/10 text-blue-300'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                              }`}
                            >
                              <div className="relative">
                                <div className={`w-1.5 h-1.5 rounded-full ${isHistoryActive ? 'bg-blue-400' : 'bg-gray-600'}`} />
                                {index !== player.history.length - 1 && (
                                  <div className="absolute top-1.5 left-[2.5px] w-px h-full bg-gray-800 -z-10" />
                                )}
                              </div>
                              <div className="flex-1 flex flex-col">
                                <span className="text-xs font-mono">
                                  {formatDate(entry.timestamp)}
                                </span>
                                {index === 0 && (
                                  <span className="text-[10px] text-green-500 font-medium">Latest</span>
                                )}
                              </div>
                              
                              {index !== 0 && (
                                <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      if(confirm('Delete this version?')) onDeleteHistory(player.id, entry.id);
                                  }}
                                  className="opacity-0 group-hover/item:opacity-100 text-gray-600 hover:text-red-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};