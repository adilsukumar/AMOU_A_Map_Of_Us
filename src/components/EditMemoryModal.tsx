import { useState } from 'react';
import { Memory } from '@/hooks/useMemories';
import { X } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface EditMemoryModalProps {
  memory: Memory;
  onSave: (id: string, updates: { title: string; description: string; color: string; is_public: boolean }) => void;
  onClose: () => void;
}

const EditMemoryModal = ({ memory, onSave, onClose }: EditMemoryModalProps) => {
  const [title, setTitle] = useState(memory.title);
  const [description, setDescription] = useState(memory.description || '');
  const [color, setColor] = useState(memory.color);
  const [isPublic, setIsPublic] = useState(memory.is_public);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(memory.id, {
      title: title.trim() || 'Memory',
      description: description.trim(),
      color,
      is_public: isPublic,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[1010] bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[1011] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2a3142] border border-[#3d4555] rounded-xl p-4 w-full max-w-lg shadow-2xl animate-fade-in pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-playfair text-[#e8eaed]">Edit Memory</h2>
            <button 
              onClick={onClose}
              className="p-1 text-[#8b95a5] hover:text-[#e8eaed] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title - Full width */}
            <div>
              <label className="block text-xs font-playfair text-[#c4c9d4] mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Memory title..."
                className="w-full px-3 py-2 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                         text-[#e8eaed] font-playfair placeholder:text-[#8b95a5] text-sm
                         focus:outline-none focus:border-[#6b7a94] transition-colors"
              />
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-playfair text-[#c4c9d4] mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened here..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                             text-[#e8eaed] font-playfair placeholder:text-[#8b95a5] text-sm
                             focus:outline-none focus:border-[#6b7a94] transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      isPublic ? 'bg-[#6b7a94]' : 'bg-[#3d4555]'
                    }`}
                  >
                    <span 
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#e8eaed] transition-all ${
                        isPublic ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-playfair text-[#e8eaed]">
                    Make public
                  </span>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                <ColorPicker selectedColor={color} onColorSelect={setColor} />
              </div>
            </div>

            {/* Submit button - Full width */}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#e8eaed] text-[#1e2433] font-playfair font-medium rounded-lg
                       hover:bg-[#d4d7dd] transition-colors text-sm"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditMemoryModal;
