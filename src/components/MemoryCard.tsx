import { useState } from 'react';
import { Memory } from '@/hooks/useMemories';
import { X, Trash2, Globe, Lock, Pencil, MapPin, Check } from 'lucide-react';
import EditMemoryModal from './EditMemoryModal';
import { useAuth } from '@/contexts/AuthContext';

interface MemoryCardProps {
  memory: Memory;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title: string; description: string; color: string; is_public: boolean }) => void;
}

const MemoryCard = ({ memory, onClose, onDelete, onUpdate }: MemoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  
  const isOwner = user?.id === memory.user_id;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCoordinates = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  const handleSave = (id: string, updates: { title: string; description: string; color: string; is_public: boolean }) => {
    onUpdate(id, updates);
    setIsEditing(false);
  };

  return (
    <>
      {/* Backdrop - darker, no blur */}
      <div 
        className="fixed inset-0 z-[1005] bg-black/60"
        onClick={onClose}
      />
      
      {/* Card - Centered Modal Style */}
      <div className="fixed inset-0 z-[1006] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto animate-scale-in">
          <div className="bg-[#1e2433] rounded-2xl shadow-2xl overflow-hidden border border-[#2d3548]">
            
            {/* Photo Header */}
            {memory.photo_url && (
              <div className="relative h-52">
                <img 
                  src={memory.photo_url} 
                  alt={memory.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="p-7">
              {/* Title Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: memory.color,
                      boxShadow: `0 0 12px ${memory.color}60`
                    }}
                  />
                  <h3 className="text-xl font-playfair text-white font-semibold truncate">
                    {memory.title}
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-[#a0a8b8] bg-[#2a3142] px-2.5 py-1.5 rounded-lg flex-shrink-0 ml-3">
                  {memory.is_public ? (
                    <>
                      <Globe size={11} />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock size={11} />
                      Private
                    </>
                  )}
                </span>
              </div>
              
              {/* Description */}
              {memory.description && (
                <div className="max-h-32 overflow-y-auto mb-5">
                  <p className="text-[#a0a8b8] font-playfair text-base mb-0 leading-relaxed font-medium">
                    {memory.description}
                  </p>
                </div>
              )}
              
              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-[#6b7a94] mb-6 pb-6 border-b border-[#2d3548]">
                <span className="font-playfair font-medium">
                  {formatDate(memory.created_at)}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={13} />
                  {formatCoordinates(memory.latitude, memory.longitude)}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 
                             bg-[#2a3142] hover:bg-[#353d4f] text-white 
                             font-playfair text-base font-medium rounded-xl transition-colors"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this memory?')) {
                        onDelete(memory.id);
                      }
                    }}
                    className="flex items-center justify-center py-3.5 px-4 
                             bg-[#2a3142] hover:bg-red-500/20 text-[#6b7a94] hover:text-red-400
                             rounded-xl transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 
                           bg-white hover:bg-gray-100 text-[#1e2433] 
                           font-playfair text-base font-semibold rounded-xl transition-colors"
                >
                  <Check size={15} />
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditMemoryModal
          memory={memory}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default MemoryCard;
