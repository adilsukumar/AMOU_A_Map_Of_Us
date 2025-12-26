import { useState, useMemo } from 'react';
import { Memory } from '@/hooks/useMemories';
import { X, Globe, Lock, MapPin, Calendar, Trash2, Search, Pencil } from 'lucide-react';
import EditMemoryModal from './EditMemoryModal';
import { useAuth } from '@/contexts/AuthContext';

interface MemoriesPanelProps {
  memories: Memory[];
  isOpen: boolean;
  onClose: () => void;
  onMemoryClick: (memory: Memory) => void;
  onDeleteMemory: (id: string) => void;
  onUpdateMemory: (id: string, updates: { title: string; description: string; color: string; is_public: boolean }) => void;
}

const MemoriesPanel = ({ memories, isOpen, onClose, onMemoryClick, onDeleteMemory, onUpdateMemory }: MemoriesPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const { user } = useAuth();

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const query = searchQuery.toLowerCase();
    return memories.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        (m.description?.toLowerCase().includes(query) ?? false)
    );
  }, [memories, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1002]"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#1e2433] border-l border-[#3d4555] 
                   z-[1003] transform transition-transform duration-300 ease-out shadow-2xl
                   ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d4555]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2a3142] flex items-center justify-center">
              <MapPin size={20} className="text-[#8b95a5]" />
            </div>
            <div>
              <h2 className="text-xl font-playfair text-[#e8eaed]">My Memories</h2>
              <p className="text-sm text-[#8b95a5]">{memories.length} {memories.length === 1 ? 'memory' : 'memories'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#2a3142] flex items-center justify-center
                     text-[#8b95a5] hover:text-[#e8eaed] hover:bg-[#353d4f] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a94]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#2a3142] border border-[#3d4555] rounded-xl
                       text-[#e8eaed] placeholder:text-[#6b7a94] text-sm font-playfair
                       focus:outline-none focus:border-[#4d5565] transition-colors"
            />
          </div>
        </div>

        {/* Memories List */}
        <div className="overflow-y-auto h-[calc(100%-160px)] p-4 space-y-3">
          {filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a3142] flex items-center justify-center mb-4">
                <MapPin size={32} className="text-[#8b95a5]" />
              </div>
              <p className="text-[#8b95a5] font-playfair">
                {searchQuery ? 'No memories found' : 'No memories yet'}
              </p>
              <p className="text-sm text-[#6b7280] mt-1">
                {searchQuery ? 'Try a different search term' : 'Click the pin button to add your first memory'}
              </p>
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <div 
                key={memory.id}
                className="bg-[#2a3142] rounded-xl p-4 border border-[#3d4555] 
                         hover:border-[#4d5565] transition-all cursor-pointer group"
                onClick={() => {
                  onMemoryClick(memory);
                  onClose();
                }}
              >
                {/* Title & Actions */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: memory.color || '#8B9DC3' }}
                    />
                    <h3 className="text-[#e8eaed] font-playfair font-medium line-clamp-1">
                      {memory.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {memory.is_public ? (
                      <Globe size={14} className="text-[#6b7a94]" />
                    ) : (
                      <Lock size={14} className="text-[#6b7a94]" />
                    )}
                    {user?.id === memory.user_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMemory(memory);
                        }}
                        className="p-1 text-[#6b7a94] hover:text-blue-400 transition-colors 
                                 opacity-0 group-hover:opacity-100"
                        title="Edit memory"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {user?.id === memory.user_id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this memory?')) {
                            onDeleteMemory(memory.id);
                          }
                        }}
                        className="p-1 text-[#6b7a94] hover:text-red-400 transition-colors 
                                 opacity-0 group-hover:opacity-100"
                        title="Delete memory"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo thumbnail */}
                {memory.photo_url && (
                  <div className="mb-3 -mx-1">
                    <img 
                      src={memory.photo_url} 
                      alt={memory.title}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Description */}
                {memory.description && (
                  <p className="text-[#8b95a5] text-sm font-playfair italic mb-3 line-clamp-2">
                    {memory.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 text-xs text-[#6b7a94]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(memory.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {formatCoordinates(memory.latitude, memory.longitude)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingMemory && (
        <EditMemoryModal
          memory={editingMemory}
          onSave={(id, updates) => {
            onUpdateMemory(id, updates);
            setEditingMemory(null);
          }}
          onClose={() => setEditingMemory(null)}
        />
      )}
    </>
  );
};

export default MemoriesPanel;
