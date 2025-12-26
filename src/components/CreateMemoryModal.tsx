import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memory: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    color: string;
    is_public: boolean;
  }) => void;
  coordinates: { lat: number; lng: number } | null;
}

const COLORS = [
  '#8B9DC3', '#B8D4E3', '#9FD5D1', '#87CEAB',
  '#A8E6CF', '#FFE5B4', '#FFDAB9', '#FFC8A2',
  '#FFB6C1', '#E6A8D7', '#D4A5D9', '#C9B1FF',
];

const CreateMemoryModal = ({ isOpen, onClose, onSubmit, coordinates }: CreateMemoryModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen || !coordinates) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      color: selectedColor,
      is_public: isPublic
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSelectedColor(COLORS[0]);
    setIsPublic(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg p-3 w-full max-w-2xl animate-fade-in shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={16} />
        </button>

        <h2 className="text-base font-playfair text-foreground mb-1">
          Create Memory
        </h2>
        <p className="text-xs text-muted-foreground font-playfair italic mb-3">
          Pin a moment here
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title - Full width */}
          <div>
            <label className="block text-xs font-playfair text-muted-foreground mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-2 py-1.5 bg-secondary/50 border border-border rounded-sm 
                       text-foreground font-playfair placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-foreground/50 transition-colors text-sm"
              placeholder="Name this memory..."
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left column */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-playfair text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 bg-secondary/50 border border-border rounded-sm 
                           text-foreground font-playfair placeholder:text-muted-foreground/50
                           focus:outline-none focus:border-foreground/50 transition-colors resize-none text-sm"
                  placeholder="What happened here..."
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    isPublic ? 'bg-foreground' : 'bg-secondary'
                  }`}
                >
                  <span 
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-card transition-all ${
                      isPublic ? 'left-4' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-xs font-playfair text-muted-foreground">
                  Make public
                </span>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-playfair text-muted-foreground mb-1">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full transition-all ${
                        selectedColor === color 
                          ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Photo upload placeholder */}
              <div>
                <label className="block text-xs font-playfair text-muted-foreground mb-1">
                  Photo (Coming Soon)
                </label>
                <div className="w-full h-12 bg-secondary/30 border border-dashed border-border rounded-sm 
                             flex items-center justify-center text-xs text-muted-foreground font-playfair">
                  📸 Upload Photo
                </div>
              </div>
            </div>
          </div>

          {/* Buttons - Full width */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-2 py-1.5 border border-border text-muted-foreground 
                       font-playfair hover:bg-secondary/50 transition-colors rounded-sm text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-2 py-1.5 bg-foreground text-background font-playfair 
                       hover:bg-foreground/90 transition-colors rounded-sm text-sm"
            >
              Save Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMemoryModal;
